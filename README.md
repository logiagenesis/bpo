# BPO MAX / Apexline

A BPO operations desk for leads, offers, proposals, clients, vendors, tasks, QA, effort, cash and profit.

**One repository. One branch: `main`.**

## Master report

[Read the full master audit, build and publication report](./MASTER_REPORT.md)

[Download the complete Markdown report](https://raw.githubusercontent.com/logiagenesis/bpo/main/MASTER_REPORT.md)

The standalone report includes the workshop assessment, historical competitor research, repository findings, implemented features, verified numbers, test evidence, setup guide, GitHub consolidation and unfinished production work. Historical research is clearly distinguished from newly verified findings.

## Current status

Both earlier development histories are preserved on main. PR #1 and PR #2 are merged; their working branches have been deleted. Source and documentation are public on GitHub. The app is a runnable local MVP; a publicly hosted application has not been deployed.

## Run

Requires compatible Node.js (22.12+ baseline) and pnpm.

```sh
git clone https://github.com/logiagenesis/bpo.git
cd bpo
pnpm install
pnpm dev
```

Open the local URL Vite prints, normally http://127.0.0.1:5173. If the port changes, browser storage uses a different origin.

```sh
pnpm check
pnpm validate
pnpm build
```

TypeScript, domain validation, and client/server production builds passed for the consolidated version.

## Optional AI

Copy .env.example to .env and set XAI_API_KEY plus an account-supported XAI_MODEL. Keys remain on the server. Without a key, manual workflows and demo drafts remain available; live AI generation was not tested. Audits use operator notes and a reference URL, not an automatic website crawl.

## Data and boundaries

Fictional demo data persists in one browser. Export/import workspace backups from Profit. Reset and import require confirmation before replacement. Marketplace presets and FX are planning assumptions; set actual contract fees and an appropriate dated rate.

This version has no authentication, tenant isolation, shared database, payment-provider reconciliation or public deployment adapter. The portal is an internal preview. Payment checks and margin warnings are not universally enforced domain gates. See the master report for the detailed limitations and next build order.

## Stack

React 19 · TanStack Start/Router · Tailwind CSS 4 · Zustand · Vite · pnpm.
