# BPO MAX / Apexline

A local BPO operations desk: score leads, price offers, draft proposals, move deals through a pipeline, manage clients and vendors, track tasks and QA, and review client profit.

## Run locally

Requires Node.js 22.12+ and pnpm.

    pnpm install
    pnpm dev

Open http://127.0.0.1:5173. Validate with `pnpm check` and `pnpm build`.
The TanStack Start build includes both client assets and a server bundle.

## AI setup

Copy .env.example to .env and set XAI_API_KEY and an account-supported XAI_MODEL. Keys remain on the server. Without a key, AI actions report that AI is unavailable; manual workflows and seeded drafts remain usable. Requests use the configured xAI service and may incur usage charges. Review generated claims and pricing before use.

Audits use operator-supplied notes and a reference URL. This version does not fetch arbitrary prospect websites.

## Data and limits

The initial workspace uses fictional demo leads and clients. Edits persist in browser localStorage on the same origin. Reset from Profit requires confirmation. Clearing browser storage removes saved edits.

This is a single-operator local MVP, with no authentication, shared database, payment processing, or external outreach delivery. The client portal is an internal preview. Invoice flags are operator-entered; payment-before-work is an operating reminder, not payment verification. Offers display margin warnings; planning FX is illustrative, not live.

Keep the development server local. A public deployment needs authentication, server-side tenant storage, AI rate limits, and a deployment adapter.

## Source

Based on the existing logiagenesis/bpo Apexline source. The workshop notes are reference material; revenue and market claims are not presented as verified evidence.

Built with React 19, TanStack Start/Router, Tailwind CSS 4, and Zustand.

