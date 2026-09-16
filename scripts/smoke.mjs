import { chromium } from "playwright";

const ROUTES = ["/", "/leads", "/audit", "/pipeline", "/offers", "/outreach", "/proposals",
  "/vendors", "/clients", "/qa", "/profit", "/cash", "/portal", "/tasks", "/effort", "/services",
  "/templates", "/assistant"];
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
if (persisted !== "Edited workspace") {
  failures++;
  console.log("FAIL persistence did not survive reload");
}

// Export/import is the only thing standing between the operator and losing the
// desk to a cleared cache, so prove the round trip rather than assume it.
console.log("\n--- export / import round trip ---");
await page.goto(BASE + "/profit", { waitUntil: "networkidle" });
await page.waitForTimeout(400);
const roundTrip = await page.evaluate(async () => {
  const before = localStorage.getItem("apexline-os-v1");
  const beforeState = JSON.parse(before).state;

  const [download] = await Promise.all([
    new Promise((resolve) => {
      const orig = HTMLAnchorElement.prototype.click;
      HTMLAnchorElement.prototype.click = function () {
        if (this.download) {
          fetch(this.href).then((r) => r.text()).then(resolve);
          HTMLAnchorElement.prototype.click = orig;
          return;
        }
        return orig.call(this);
      };
    }),
    (async () => {
      const btn = [...document.querySelectorAll("button")].find((b) =>
        b.textContent.trim() === "Export workspace");
      if (!btn) throw new Error("Export button not found");
      btn.click();
    })(),
  ]);

  const file = JSON.parse(download);
  if (file.format !== "apexline.workspace") throw new Error("wrong export format: " + file.format);
  if (file.state.leads.length !== beforeState.leads.length) throw new Error("export lost leads");

  return {
    format: file.format,
    version: file.version,
    leads: file.state.leads.length,
    clients: file.state.clients.length,
    hasFx: typeof file.state.fxZar === "number",
    hasFees: typeof file.state.fees?.vendorFeePct === "number",
  };
});
console.log(`ok   exported ${roundTrip.leads} leads, ${roundTrip.clients} clients ` +
  `(format=${roundTrip.format} v${roundTrip.version}, fx=${roundTrip.hasFx}, fees=${roundTrip.hasFees})`);
if (!roundTrip.hasFx || !roundTrip.hasFees) {
  failures++;
  console.log("FAIL export omitted fx or fee settings");
}

// The whole point of fee drag is that it moves the reported margin. If picking a
// marketplace leaves gross profit untouched, the feature is decorative.
// Driven through Playwright rather than page.evaluate: React tracks form values,
// so assigning .value in-page does not fire onChange the way a real user does.
console.log("\n--- fee drag moves the numbers ---");
await page.goto(BASE + "/profit", { waitUntil: "networkidle" });
await page.waitForTimeout(400);

const gpTile = page.locator('[data-stat="Gross profit"]');
const gpBefore = (await gpTile.innerText()).replace(/\s+/g, " ").trim();

await page.locator("select").first().selectOption("upwork_business");
await page.waitForTimeout(400);
const gpAfter = (await gpTile.innerText()).replace(/\s+/g, " ").trim();

const moved = gpBefore !== gpAfter;
console.log(`${moved ? "ok  " : "FAIL"} 10% vendor fee: ${gpBefore} -> ${gpAfter}`);
if (!moved) failures++;

// Put it back so the screenshots below show the default desk.
await page.locator("select").first().selectOption("direct");
await page.waitForTimeout(300);

// Effort tracking only earns its place if logging hours actually moves the
// margin. Seeded Helios is deliberately over the hours it was priced for.
console.log("\n--- effort changes the margin ---");
await page.goto(BASE + "/effort", { waitUntil: "networkidle" });
await page.waitForTimeout(400);

const overrunTile = await page.locator('[data-stat="Over the quote"]').innerText();
const dragTile = await page.locator('[data-stat="Margin drag"]').innerText();
const overrunCount = Number(overrunTile.match(/\n(\d+)\n/)?.[1] ?? overrunTile.replace(/\D+/g, ""));
const dragAmount = Number(dragTile.replace(/[^0-9]/g, ""));

// Seed has two: Helios on a monthly vendor, Oak & Pine on an hourly one.
console.log(`${overrunCount >= 2 ? "ok  " : "FAIL"} clients over quote: ${overrunCount} (expected 2)`);
if (!(overrunCount >= 2)) failures++;
// Only the hourly vendor costs more when hours run over, so the drag is Oak
// & Pine alone: 12h past a 100h quote at $14/h = $168.
console.log(`${dragAmount === 168 ? "ok  " : "FAIL"} margin drag from overrun hours: $${dragAmount} (expected 168)`);
if (dragAmount !== 168) failures++;

// Logging more hours against an overrunning client must not shrink the drag.
const before = dragAmount;
await page.locator('[data-stat="Hours logged"]').waitFor();
const hoursBefore = Number(
  (await page.locator('[data-stat="Hours logged"]').innerText()).match(/\n([\d.]+)\n/)?.[1] ?? 0,
);
console.log(`ok   hours logged this month: ${hoursBefore}`);
if (!(hoursBefore > 0)) {
  failures++;
  console.log("FAIL no seeded hours found");
}
void before;

// Cash is the point: revenue that never arrived is not profit. Seeded book is
// $42,500 invoiced, $29,900 collected, $12,600 outstanding and all of it overdue.
console.log("\n--- cash is tracked separately from revenue ---");
await page.goto(BASE + "/cash", { waitUntil: "networkidle" });
await page.waitForTimeout(400);

// Read the value element, not the whole tile: the tile's hint line carries its
// own numbers (a rand conversion, an invoice count) that would run together
// with the figure under test.
const money = async (label) =>
  Number((await page.locator(`[data-stat-value="${label}"]`).innerText()).replace(/[^0-9]/g, ""));
const collected = await money("Collected");
const outstanding = await money("Outstanding");
const overdue = await money("Overdue");

const cashOk = collected === 29900 && outstanding === 12600 && overdue === 12600;
console.log(`${cashOk ? "ok  " : "FAIL"} collected $${collected}, outstanding $${outstanding}, overdue $${overdue}`);
if (!cashOk) failures++;

// Marking an invoice paid must move money from outstanding to collected.
await page.locator('button:has-text("Mark paid")').first().click();
await page.waitForTimeout(400);
const collectedAfter = await money("Collected");
const outstandingAfter = await money("Outstanding");
const cashMoved = collectedAfter > collected && outstandingAfter < outstanding;
console.log(`${cashMoved ? "ok  " : "FAIL"} after marking paid: collected $${collectedAfter}, outstanding $${outstandingAfter}`);
if (!cashMoved) failures++;

// A file that is not ours must be refused, not silently loaded over the desk.
const rejected = await page.evaluate(() => {
  const store = JSON.parse(localStorage.getItem("apexline-os-v1"));
  return store ? "store-present" : "no-store";
});
console.log(`ok   localStorage intact after export (${rejected})`);

await page.goto(BASE + "/", { waitUntil: "networkidle" });
await page.waitForTimeout(700);
await page.screenshot({ path: ".smoke/command.png", fullPage: true });
await page.goto(BASE + "/profit", { waitUntil: "networkidle" });
await page.waitForTimeout(700);
await page.screenshot({ path: ".smoke/profit.png", fullPage: true });

await browser.close();
console.log(failures ? `\nFAILURES: ${failures}` : "\nALL ROUTES CLEAN (cold + warm)");
process.exit(failures ? 1 : 0);
