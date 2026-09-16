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
| 5 | Effort spent vs quoted | ● | `TimeEntry` + `clientEffort()`, Effort desk at `/effort` |
| 5 | QA per cycle | ● | `QaReview`, `src/routes/qa.tsx` |
| 5 | Client status without exposing vendor | ● | `src/routes/portal.tsx` |
| 6 | Invoice records | ● | `Invoice` entity, Cash desk at `/cash` |
| 6 | Cash collected vs invoiced | ● | `cashSummary()` — collected, outstanding, overdue |
| 6 | DSO | ● | `cashSummary().dso`, unpaid counted to today |
| 6 | Overdue escalation | ● | ageing buckets, days-late per invoice, overdue flagged on Profit from real invoices |
| 7 | Churn, lifetime, lifetime GP | ○ | `churned` status exists; no economics derived |
| 7 | CSAT early warning | ● | `Client.csat`, at-risk flagging in `kpis()` |
| 7 | Renewal / price-review dates | ○ | `startDate` only; no renewal field |
| 8 | GP and margin per client | ● | `clientPnl` in `money.ts`, `src/routes/profit.tsx` |
| 8 | Margin drift over time | ○ | every figure is a snapshot |
| 8 | Alert when actuals breach the floor | ● | overrun flagged on Effort and Profit; margin-at-quote vs margin-actual |
| 8 | Export everything | ● | `exportWorkspace` / `importWorkspace`, versioned file, round trip covered by `npm run smoke` |

**28 built, 3 partial, 7 missing** (was 19/5/14). All five items of the original
build order have shipped. What remains is the analytics layer, which is mostly
derivation now that effort and cash exist.

## The five that cost real money

### 1. Vendor cost is a guess, and the guess is hardcoded — **fixed**

`vendorMonthly()` billed every hourly vendor at **exactly 80 hours, every month,
forever**, and nothing recorded what was actually worked. `clientPnl` therefore
reported the margin you assumed at signing, restated monthly with total
confidence.

Now `TimeEntry` records hours against a client and vendor, `Client.quotedHoursPerMonth`
records what the price assumed, and `clientVendorCost()` costs the month on hours
actually logged. The Effort desk (`/effort`) shows quoted vs logged, burn
percentage, and **margin at quote against margin actual** side by side.

Two shapes of overrun, and the desk distinguishes them:

- **Monthly vendor** — Helios, 369h against a 360h quote. Cost unchanged, so
  margin holds at 62%; the flag is a renewal and quality risk, not a bill.
- **Hourly vendor** — Oak & Pine, 112h against a 100h quote at $14/h. Margin
  drops **58% → 54%**, $168 of gross profit gone this month.

A client with nothing logged reads "—", not a number: an unmeasured margin is an
assumption and should not be dressed as a measurement.

While wiring this up, the overrun test originally carried a 5% tolerance band. It
hid Helios entirely — 369 against 360 is over, and a desk built to show leakage
should not have a band that conceals it. Removed.

### 2. Platform fees are invisible — **fixed**

`priceFromCost` took vendor cost and a target margin and returned a price, with
no fees anywhere. Now `FeeProfile` carries the sourcing channel and the payment
processing rate: marketplace fees raise the cost base via `landedVendorCost`, and
payment fees are grossed up out of revenue.

Measured on the seeded workspace: switching sourcing from Direct to Upwork
Business Plus moves gross profit from **$10,460 (60.1%) to $9,800 (56.3%)** — a
3.8-point margin drop that the desk previously did not show at all. Asserted in
`npm run smoke`.

### 3. There is no cash — **fixed**

`Client.invoiceStatus` was `"current" | "overdue" | "unpaid_setup"` and nothing
else: no amount, no issue date, no due date, no paid date. The Profit desk showed
gross profit that might have been entirely uncollected.

`Invoice` now records amount, issue, due and paid dates. The Cash desk (`/cash`)
reports collected against invoiced, outstanding, overdue, DSO, and an ageing
breakdown. On the seeded book: **$42,500 invoiced, $29,900 collected, $12,600
outstanding and all of it past due**, with Meridian's July retainer 63 days late
while the Profit desk reports its 57% margin every month.

DSO counts unpaid invoices to today rather than excluding them — leaving stale
invoices out would make the number improve as collections got worse.

The Profit desk's overdue flag now derives from actual invoices instead of the
hand-set status enum nobody remembers to update. `setupSettled()` makes the
README's "no vendor work before setup and month 1 are paid" rule checkable
rather than a thing to remember.

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
4. ~~**Effort tracking and actual-vs-quoted margin**~~ — **done.**
5. ~~**Invoices and cash**~~ — **done.**

Next, and all derivation rather than new plumbing:

6. **Win rate and pipeline velocity by segment** — needs stage changes
   timestamped, which they currently are not.
7. **Churn, lifetime, lifetime gross profit** — `churned` exists as a status;
   no economics come off it.
8. **Margin drift over time** — every figure is still a snapshot. Effort and
   cash history now exist to derive it from.
9. **Vendor utilisation roll-up** — hours are tracked per client but not
   summed per vendor, so "can this vendor take another client" is still a guess.

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
