# Apexline

Profit-first BPO operating system. Find the client, price the margin, run the work.

Apexline is not a course, not a bidding bot, and not a generic CRM. It is the desk an operator uses to:

1. Score and audit leads
2. Build offers from vendor cost + target margin
3. Draft outreach and proposals (you copy, you send)
4. Run a pipeline through to a paid retainer
5. Assign vendors, score QA, and watch client P&L

## What it will not do

- Auto-apply or mass-bid on freelance marketplaces
- Send email, LinkedIn, or WhatsApp unattended
- Start vendor work before setup + month 1 is marked paid
- Let vendors talk to clients unless you say so

Those behaviours break platform rules and destroy margin. Drafts only.

## Money path

Lead → audit → draft → call → proposal → won (setup unpaid) → vendor assigned → weekly QA → Friday report → profit desk.

Target gross margin 45–60%. Below 40% the quote is blocked with a warning.

## Demo workspace

The app ships with a seeded Pretoria-operator workspace (Northbridge, Helios, Oak & Pine, Meridian). Data lives in the browser. Reset from Profit.

## Stack

TanStack Start, React 19, Tailwind v4, Zustand. AI drafts via the server when a key is present.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

Ship build:

```bash
npm run build      # -> .output (Nitro)
npm start          # node .output/server/index.mjs, PORT defaults to 3000
```

Nitro detects the host at build time: locally it emits a Node server, and on
Vercel it emits `.vercel/output`. No per-host config to maintain.

Checks:

```bash
npm run typecheck  # tsc --noEmit
npm run smoke      # every route in a real browser, against a running server
```

`npm run smoke` drives Chromium over all 16 routes twice — once cold, once with an
edited workspace in localStorage — and fails on any console error, non-200, or
hydration mismatch. It needs the server up (`npm start`) and Playwright browsers
(`npx playwright install chromium`). Point it elsewhere with `SMOKE_BASE_URL`.

Set `XAI_API_KEY` to enable the AI draft endpoints; without it the desk runs fine
and the draft buttons report that AI is unavailable.
