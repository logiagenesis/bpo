import { createServerFn } from "@tanstack/react-start";

type ChatOk = { ok: true; text: string };
type ChatErr = { ok: false; error: string };
export type ChatResult = ChatOk | ChatErr;

async function chat(system: string, user: string, max_tokens = 1400): Promise<ChatResult> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return { ok: false, error: "AI is not available in this environment." };
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "grok-4.5",
      max_tokens,
      temperature: 0.4,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) return { ok: false, error: `Model error ${res.status}` };
  const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return { ok: true, text: body.choices?.[0]?.message?.content ?? "" };
}

async function siteText(url: string): Promise<string> {
  try {
    const u = new URL(url);
    if (!/^https?:$/.test(u.protocol)) return "";
    const res = await fetch(u.toString(), {
      signal: AbortSignal.timeout(7000),
      headers: { "User-Agent": "ApexlineAudit/1.0" },
    });
    const html = await res.text();
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .slice(0, 7000);
  } catch {
    return "";
  }
}

const AUDIT_SYS = `You are a BPO operator auditing a prospect so we can sell an outcome, not labour.
Return STRICT JSON with keys:
business, bottlenecks (string[]), opportunities (string[]), package, monthlyValueUsd (number),
angle, emailDraft, linkedinDraft, callOpener, proposalSummary, painPoints (string[]), suggestedOffer.
Drafts are written for a human to copy and send. Never claim you will send them.
Price monthly retainers in USD assuming 45-60% gross margin after a vendor in a lower-cost market.
Be specific. No fluff. No lifestyle claims.`;

export const runAudit = createServerFn({ method: "POST" })
  .validator((input: { url: string; notes: string; company: string }) => input)
  .handler(async ({ data }) => {
    const extracted = data.url ? await siteText(data.url) : "";
    const user = `Company: ${data.company}
URL: ${data.url}
Operator notes: ${data.notes}
Extracted homepage text (may be empty): ${extracted || "(none)"}`;
    return chat(AUDIT_SYS, user, 1600);
  });

export const runOutreach = createServerFn({ method: "POST" })
  .validator((input: { lead: string; tone: string; channel: string; offer: string }) => input)
  .handler(async ({ data }) => {
    const sys = `You write BPO outreach DRAFTS. A human will copy and send them. Never imply automation or mass bidding.
Tone: ${data.tone}. Channel: ${data.channel}.
Sell an outcome (appointments, tickets, lists) not "cheap VAs".
If channel is email, first line is Subject: ...
Keep it short. Sign off Apexline. End with a line: (Draft — you send this.)`;
    return chat(sys, `Lead:\n${data.lead}\nOffer:\n${data.offer}`, 900);
  });

export const runProposal = createServerFn({ method: "POST" })
  .validator((input: { lead: string; offer: string }) => input)
  .handler(async ({ data }) => {
    const sys = `Write a BPO proposal as STRICT JSON with keys:
problem, solution, deliverables, timeline, pricing, sla, reporting, terms, nextSteps, title.
Price from the offer. Include setup fee + first month in advance. Work starts when funds clear.
Vendor has no client contact. Human-approved. No cheap-labour language.`;
    const r = await chat(sys, `Lead:\n${data.lead}\nOffer:\n${data.offer}`, 1600);
    return r;
  });

export const runJobDraft = createServerFn({ method: "POST" })
  .validator((input: { job: string; offer: string; tone: string }) => input)
  .handler(async ({ data }) => {
    const sys = `The operator will paste this into a freelance job thread THEMSELVES.
Write a proposal they can copy. Do not invent platform automation. Do not mention bidding bots.
Tone: ${data.tone}. Outcome-led. Ask one clarifying question. Include a simple SLA and a price range only if the offer has one.
End with (Draft — you send this.)`;
    return chat(sys, `Job post:\n${data.job}\nOur offer:\n${data.offer}`, 900);
  });

export const runAssistant = createServerFn({ method: "POST" })
  .validator((input: { question: string; snapshot: string }) => input)
  .handler(async ({ data }) => {
    const sys = `You are the Apexline desk assistant. You help an operator make money today.
Prioritise: unpaid invoices, at-risk clients, hottest leads, thin margins, overdue tasks.
Never suggest auto-bidding or unattended sending. Be concrete. Use names and numbers from the snapshot.`;
    return chat(sys, `Question: ${data.question}\n\nSnapshot:\n${data.snapshot}`, 1100);
  });

export const runOfferCopy = createServerFn({ method: "POST" })
  .validator((input: { spec: string }) => input)
  .handler(async ({ data }) => {
    const sys = `Turn an offer spec into STRICT JSON: name, deliverables, copy (one line), upsells, riskWarnings.
Sell the outcome. Flag margin risk if implied margin is under 40%.`;
    return chat(sys, data.spec, 800);
  });
