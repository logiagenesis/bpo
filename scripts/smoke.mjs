import { chromium } from "playwright";

const ROUTES = ["/", "/leads", "/audit", "/pipeline", "/offers", "/outreach", "/proposals",
  "/vendors", "/clients", "/qa", "/profit", "/portal", "/tasks", "/services", "/templates", "/assistant"];
const BASE = process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:3000";
// The sandbox proxy has no CA for fonts.googleapis.com; that is an environment
// artefact, not an app fault, so it is filtered out of the failure count.
const NOISE = /favicon|manifest|fonts\.googleapis|ERR_CERT_AUTHORITY_INVALID|404 \(Not Found\)/i;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 950 } });
const page = await ctx.newPage();
let failures = 0;

async function sweep(label) {
  console.log(`\n--- ${label} ---`);
  for (const route of ROUTES) {
    const errors = [];
    page.removeAllListeners("console");
    page.removeAllListeners("pageerror");
    page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
    page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));

    const res = await page.goto(BASE + route, { waitUntil: "networkidle" });
    await page.waitForTimeout(350);
    const text = (await page.locator("body").innerText()).trim();
    const bad = errors.filter((e) => !NOISE.test(e));
    const ok = bad.length === 0 && res?.ok() && text.length > 50;
    if (!ok) failures++;
    console.log(`${ok ? "ok  " : "FAIL"} ${res?.status()} chars=${String(text.length).padStart(5)} ${route}`);
    for (const e of bad.slice(0, 2)) console.log(`       ! ${e.slice(0, 180)}`);
  }
}

await sweep("cold (no saved workspace)");

// Persisted state is the case that used to break hydration: the server renders
// the seed while the browser holds edited data.
await page.goto(BASE + "/", { waitUntil: "networkidle" });
await page.evaluate(() => {
  const raw = localStorage.getItem("apexline-os-v1");
  if (!raw) throw new Error("store did not persist to localStorage");
  const parsed = JSON.parse(raw);
  parsed.state.workspace = "Edited workspace";
  parsed.state.leads = parsed.state.leads.slice(1);
  localStorage.setItem("apexline-os-v1", JSON.stringify(parsed));
});
await sweep("warm (edited workspace in localStorage)");

const persisted = await page.evaluate(() => JSON.parse(localStorage.getItem("apexline-os-v1")).state.workspace);
console.log(`\npersisted workspace after reload: ${JSON.stringify(persisted)}`);

await page.goto(BASE + "/", { waitUntil: "networkidle" });
await page.waitForTimeout(700);
await page.screenshot({ path: ".smoke/command.png", fullPage: true });
await page.goto(BASE + "/profit", { waitUntil: "networkidle" });
await page.waitForTimeout(700);
await page.screenshot({ path: ".smoke/profit.png", fullPage: true });

await browser.close();
console.log(failures ? `\nFAILURES: ${failures}` : "\nALL ROUTES CLEAN (cold + warm)");
process.exit(failures ? 1 : 0);
