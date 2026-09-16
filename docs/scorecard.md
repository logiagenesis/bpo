# Apexline scored against the checklist

Scored by reading the code, not the README. Every claim below cites the file it
came from. Scored September 2026 at commit `00de7df`.

**Legend** — ● built · ◐ partial · ○ missing

## The score

| # | Checklist item | | Evidence |
|---|---|---|---|
| 1 | Capture leads from any source | ● | `importLeads` + `parseCsv` in `src/lib/utils.ts` |
| 1 | Score a lead on paying signals | ● | `scoreLead` in `src/lib/money.ts` |
| 1 | Rank the list | ● | `kpis().hot` sorts by score, `src/lib/store.ts` |
| 1 | Deduplicate | ● | `importLeads` keys on email + company |
| 1 | Record lead source | ◐ | `Lead.source` exists; never aggregated into cost-per-won |
| 2 | Audit against deliverable services | ● | `src/routes/audit.tsx`, `SERVICES` in `types.ts` |
| 2 | Find budgeted pain | ● | `painPoints`, `outsourcingIntent` on `Lead` |
| 2 | Disqualify fast with reason | ◐ | `lost` stage exists; no reason captured |
| 2 | Flag unsourceable work | ○ | no check between required service and vendor skills |
| 3 | Price from vendor cost up | ● | `priceFromCost` in `src/lib/money.ts` |
| 3 | Enforce a floor margin | ● | blocked below 40%, `src/routes/offers.tsx` |
| 3 | SLA as cost multiplier | ● | `SLA_MULTIPLIER` in `types.ts` |
| 3 | Include platform + payment fees | ● | `FeeProfile` + `landedVendorCost` in `money.ts`, set on the Profit desk |
| 3 | Dual currency at a dated FX rate | ● | `fxZar` + `fxSetAt` on the store, editable, staleness flagged after 7 days |
| 4 | Draft outreach and proposals | ● | `src/routes/outreach.tsx`, `proposals.tsx` |
| 4 | Stages with probability | ● | `Deal.probability`, `PIPELINE_STAGES` |
| 4 | Weighted pipeline | ● | `kpis().pipeline` |
| 4 | Win rate by segment | ○ | nothing computes it |
| 4 | Time in stage | ○ | stage changes are not timestamped |
| 5 | Assign vendor with rate + skills | ● | `Vendor.rateUsd`, `skills`, `src/routes/vendors.tsx` |
| 5 | Gate work on payment | ● | `invoiceStatus: "unpaid_setup"` gate |
| 5 | Effort spent vs quoted | ○ | **no effort model exists** (see below) |
| 5 | QA per cycle | ● | `QaReview`, `src/routes/qa.tsx` |
| 5 | Client status without exposing vendor | ● | `src/routes/portal.tsx` |
| 6 | Invoice records | ○ | one enum on `Client`, no amounts or dates |
| 6 | Cash collected vs invoiced | ○ | not modelled |
| 6 | DSO | ○ | not modelled |
| 6 | Overdue escalation | ◐ | flagged on the dashboard; no ageing, no escalation |
| 7 | Churn, lifetime, lifetime GP | ○ | `churned` status exists; no economics derived |
| 7 | CSAT early warning | ● | `Client.csat`, at-risk flagging in `kpis()` |
| 7 | Renewal / price-review dates | ○ | `startDate` only; no renewal field |
| 8 | GP and margin per client | ● | `clientPnl` in `money.ts`, `src/routes/profit.tsx` |
| 8 | Margin drift over time | ○ | every figure is a snapshot |
| 8 | Alert when actuals breach the floor | ○ | depends on effort tracking, which is missing |
| 8 | Export everything | ● | `exportWorkspace` / `importWorkspace`, versioned file, round trip covered by `npm run smoke` |

**22 built, 4 partial, 12 missing** (was 19/5/14 — items 1, 2 and 3 of the build
order below have since shipped). Strong through pricing and winning; still thin
from delivery onward.

## The five that cost real money

### 1. Vendor cost is a guess, and the guess is hardcoded

```ts
// src/lib/store.ts
export function vendorMonthly(v: Vendor | undefined) {
  if (!v) return 0;
  return v.rateType === "monthly" ? v.rateUsd : v.rateUsd * 80;
}
```

An hourly vendor is billed at **exactly 80 hours, every month, forever.** Nothing
in the app records what was actually worked. So `clientPnl` does not report
margin — it reports the margin you assumed when you signed, restated monthly with
total confidence.

The failure mode is precisely the one that kills BPO desks: a client's scope
creeps, the vendor works 110 hours, and every screen in Apexline still shows 60%
margin right up to the moment the vendor invoices. Productive, Scoro, Accelo and
Time Doctor all exist because of this exact problem.

### 2. Platform fees are invisible — **fixed**

`priceFromCost` took vendor cost and a target margin and returned a price, with
no fees anywhere. Now `FeeProfile` carries the sourcing channel and the payment
processing rate: marketplace fees raise the cost base via `landedVendorCost`, and
payment fees are grossed up out of revenue.

Measured on the seeded workspace: switching sourcing from Direct to Upwork
Business Plus moves gross profit from **$10,460 (60.1%) to $9,800 (56.3%)** — a
3.8-point margin drop that the desk previously did not show at all. Asserted in
`npm run smoke`.

### 3. There is no cash

`Client.invoiceStatus` is `"current" | "overdue" | "unpaid_setup"`. There is no
invoice amount, no issue date, no due date, no paid date. The Profit desk shows
gross profit that may be entirely uncollected. For a desk whose stated purpose is
profit, cash is not a reporting nicety — it is the scoreboard.

### 4. FX is a hardcoded constant — **fixed**

`FX_ZAR = 18.2` sat in `money.ts` with no date and no way to change it, while
every ZAR figure an SA operator reads derives from it. The rate is now editable on
the Profit desk, stamped with the date it was set, and flagged in amber once it is
more than a week old. `FX_ZAR_SEED` remains only as the starting value.

### 5. The data can vanish — **fixed**

Everything lived in one browser's localStorage with no way out. There is now a
versioned export/import on the Profit desk (`apexline.workspace` v1), sharing one
`persisted()` definition with localStorage so an export can never drift from what
the desk saves. Imports are validated on format, version and required collections,
and merged onto the seed so an older file still loads. The round trip is asserted
in `npm run smoke`.

## Recommended order

Ranked by margin protected per hour of build:

1. ~~**Export / import**~~ — **done.**
2. ~~**FX rate editable and dated**~~ — **done.**
3. ~~**Fee drag in `priceFromCost`**~~ — **done.**
4. **Effort tracking and actual-vs-quoted margin** — the flagship, and the
   largest remaining gap. Turns every margin figure from a promise into a
   measurement, and makes the floor-margin alert real. Needs a `TimeEntry`
   entity, a quoted-effort field on `Offer`/`Client`, and `vendorMonthly` to
   stop multiplying hourly rates by a hardcoded 80.
5. **Invoices and cash** — closes the loop from profit to money. Needs an
   `Invoice` entity with amount and dates, then DSO and cash-collected derive
   from it.

Then the analytics layer (win rate, velocity, churn, LTV, margin drift), which is
mostly derivation once 4 and 5 exist.

## What not to build

The audit turned up plenty that would flatter the product and not the bank
balance. Explicitly out:

- Auto-bidding or mass-applying on marketplaces. It violates platform terms, and
  the README already commits against it.
- Surveillance-grade vendor monitoring (screenshots, keystrokes). Wrong for a
  contractor relationship, and a legal problem across borders.
- Email/SMS sending. Drafts only. Sending turns a desk into a spam liability.
- Another generic CRM surface. The audit's clearest finding is that generic CRM
  is a solved, crowded category, and it is not where the margin is.
