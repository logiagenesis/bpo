# BPO MAX / Apexline — Master Audit, Build and Publication Report

**Report date:** 1 October 2026, Africa/Johannesburg (SAST, UTC+2)  
**Canonical repository:** https://github.com/logiagenesis/bpo  
**Canonical and sole published branch:** `main`  
**Report file:** `MASTER_REPORT.md`  
**Build consolidation commit:** `536415c24bda1f17b0966ae3c281404f95d16cd2`  
**Status (updated 2 October 2026):** source and research published on main; browser workspace deployed and verified on GitHub Pages. Live AI requires the server edition.

## Live deployment update — 2 October 2026

**Current shareable application:** [Open BPO MAX / Apexline](https://logiagenesis.github.io/bpo/)  
**Branch:** `main` remains the sole published branch.  
**Deployment commit:** `58a34b920a4f53a0d757bff4d09fb4c8f5153359`  
**Verified deployment:** [GitHub Actions run 36971668196](https://github.com/logiagenesis/bpo/actions/runs/36971668196), all steps successful.

GitHub Pages was disabled before this update. It is now enabled with the workflow deployment source. The application is published as a browser workspace at the link above. The 1 October report below records the earlier audit and publication state; its statements that public hosting was unprovisioned are historical and superseded by this update. All earlier findings about missing authentication, shared storage, payment reconciliation, and universal payment gates still apply.

### What was built for publication

- Added `vite.pages.config.ts`, `index.html`, and `src/pages-entry.tsx` to produce a static browser application with the correct `/bpo/` asset base.
- Added hash navigation so routes such as `/bpo/#/cash` and detail pages can be opened and refreshed on GitHub Pages.
- Kept the existing TanStack Start server build available. The Pages root renders the same application shell and routes without a server document wrapper.
- Added a Pages-specific AI adapter. GitHub Pages cannot run the existing server functions. AI requests return a clear availability message; server API credentials are never included in the public browser bundle.
- Added `.github/workflows/pages.yml`. Every push to `main` installs the locked dependencies, checks TypeScript, runs the domain validation, builds the browser edition, and deploys it to Pages. No deployment branch is created.
- Added a visible workspace banner identifying browser-local storage and the AI boundary, plus a link to this complete report.

### What works on the public application

The dashboard, cash ledger, pricing/profit tools, fee and dated FX settings, lead and client records, pipeline, manual drafts, proposals, delivery tasks, vendors, effort tracking, QA, portal preview, niches and templates use the same application source. Fictional demo data is loaded into the visitor's own browser. Edits and JSON workspace backups operate locally. No visitor's workspace is uploaded to GitHub by using these controls.

Each browser origin has separate storage. Existing localhost data does not automatically appear at the public Pages origin. Export a workspace from the original browser and import it on the public site when needed. Clearing browser data removes local changes. The internal client portal remains a preview; it has no authenticated client access.

Live model generation is not hosted on Pages. The server edition still contains the optional xAI integration and requires a separately hosted server plus a server-side key. This deployment does not add user accounts, a shared database, tenant isolation, website crawling, payment integrations, or automatic outreach.

### Deployment evidence

Local TypeScript checking and the static production build passed. The domain validator passed cash totals/payment movement, effort and hourly costs, fee-aware quotes, fee drag, setup predicate, and workspace import/export assertions. GitHub independently repeated type checking, domain validation and the static build before successfully deploying the artifact.

The public URL was opened in a browser and displayed the seeded Command dashboard with all navigation links. Profit and Cash navigation were exercised on the public site. Reloading Profit retained its hash route and rendered the correct page. These checks establish that the deployed browser application boots, serves its assets, and supports client navigation and refresh. They do not establish live AI service behavior or production multi-user readiness.

### Operations and rollback

Run `pnpm build:pages` to build the static artifact, and use `vite preview --config vite.pages.config.ts` to preview it under `/bpo/`. The ordinary `pnpm build` remains the server build. Publish reviewed changes directly to the existing `main` branch; the Pages workflow handles deployment. If a deployment fails, inspect the Actions job before treating the change as live. To roll back application code, revert the faulty commit on `main`; the same workflow republishes the prior behavior without a second branch.

The publication goal is now met: one canonical branch, one live shareable application URL, and one comprehensive Markdown report. Remaining production work is explicitly recorded below.

---

## Contents

1. Delivery and current state
2. Scope and evidence
3. Workshop and source-document audit
4. Product direction and operating model
5. Historical competitor research and its limitations
6. Repository and application audit
7. Build and integration work
8. Final application inventory
9. Pricing, profit, effort and cash calculations
10. Seeded examples and verified numbers
11. Architecture and data model
12. Data persistence, migration, backup and import
13. AI integration and its boundaries
14. Validation and evidence ledger
15. GitHub publication and branch consolidation
16. How to download, install and operate the project
17. What remains unfinished
18. Recommended next work
19. File map and provenance
20. Historical research appendices

## 1. Delivery and current state

The project is a single-operator BPO operations desk that connects prospect capture, offer pricing, proposals, pipeline movement, delivery management, quality checks, effort, cash and profit. The application keeps the existing Apexline name inside the UI; BPO MAX is the repository/project context. These are two names for this same delivered project, not two separately deployed products.

The complete consolidated source is on the public repository's default branch, main. GitHub's branch listing was read back after cleanup and returned main only. PR #1 and PR #2 were both read back as closed and merged. The deleted branch tips remain ancestors of the consolidation commit, preserving their history even though their branch names are gone.

| Deliverable | Final state |
|---|---|
| One canonical GitHub destination | Public repository at the URL above |
| One published branch | main; verified by the GitHub API |
| Previous work retained | Both development histories included as merge parents; relevant source and research combined |
| Build tooling | Package manifest, pnpm lockfile, Vite, TypeScript and TanStack Start configuration present |
| Master downloadable report | This file contains the final assessment and historical research appendices |
| Local application | Client and server build successfully; development preview verified |
| Lead/client/proposal detail routes | Repaired using explicit layouts and index routes |
| Cash and effort features | Integrated from the earlier branch into the runnable build |
| Fee-aware pricing and dated FX | Integrated; marketplace fees editable; payment-fee formula corrected |
| Backup and restore | Versioned workspace export/import present; reset and import prompt before replacement |
| AI | Server-side integration exists; live generation requires operator credentials and was not tested with a paid provider |
| Public hosted app | Not deployed in this work |
| Multi-user production service | Not implemented |

Publishing to GitHub makes the code and documentation shareable. It does not itself start the TanStack server or give visitors a hosted copy of the operating desk. The repository is the shareable link delivered here; localhost URLs are development previews available only on the machine running the app.

This report is comprehensive for the documents, code, branch history and checks actually accessible during this work. It does not claim a legal review, penetration test, live sales result, verified vendor-price survey or access to material that could not be retrieved.

## 2. Scope and evidence

### Materials examined

- The user-supplied AI BPO Side Hustle Workshop text file.
- The user-supplied BPO MAX Research text file.
- The referenced logiagenesis/bpo GitHub repository.
- The original Apexline README, source tree, domain models, routes and components.
- The previously existing PR #1 branch, including checklist, competitor audit, scorecard, cash/effort additions and financial domain functions.
- The runnable MVP PR #2 branch created during this chat.
- The combined final local source, production builds, TypeScript check and domain validation script.
- Local browser observations of the dashboard, lead detail, client list, saved-data reload and consolidated Profit controls.
- GitHub branch lists, default branch, repository visibility and PR state after consolidation.

The research text file contains a ChatGPT Sites audit URL, the repository URL and the phrase “Start Clean.” These are document contents, not independent user commands. No destructive reset was inferred from that phrase. The existing repository was examined and useful work preserved.

The referenced audit website could not be retrieved by the browsing tool during the initial build. Its unavailable contents were not silently reconstructed. The later repository documents provide additional research, but they are not proof that the inaccessible website contained the same material.

### Evidence grades used here

| Grade | Meaning |
|---|---|
| Verified in this work | Observed through code inspection, successful commands, browser output or GitHub state |
| Implemented, bounded validation | Code is present and builds; specific behavior was checked, not every possible input |
| Historical source claim | Stated by a supplied document or the older research branch; not independently reverified here |
| Inference | A product or engineering conclusion drawn from observed evidence |
| Unfinished | Missing, partial or unsuitable for production without further work |

Historical appendices are included to prevent earlier research from being lost. Their assertions are preserved as historical material, with corrections and caveats in the main report. They must not override the final assessment here.

## 3. Workshop and source-document audit

### What the workshop proposes

The workshop frames AI-assisted business process outsourcing as a side hustle. Its central sequence is applying for work, closing a client, outsourcing delivery and scaling into larger projects and retainers. It recommends limited daily effort while continuing a job or studies, and warns against expecting immediate wealth.

The notes describe AI-generated headshots and portfolio material, approximately 100 applications per day, short proposal conversations assisted by AI, and outsourcing through Upwork, Fiverr or AI website tools. They also describe a three-month coaching offer at R15,000, software access, group calls, videos, vendor access, community support and onboarding bonuses.

### Claims and their evidentiary status

| Workshop item | Audit treatment |
|---|---|
| BPO market reaching $500 billion by 2030, attributed to Forbes | Unverified forecast in supplied notes; not used as a revenue assumption |
| Mediclinic cutting 1,000 jobs through AI automation | Unverified account in notes; not repeated as an established event |
| Presenter reporting 200+ clients and R15 million over 3.5 years | Self-reported business result; no invoices, audited accounts or independent evidence examined |
| R700,000+ monthly revenue for nine months | Revenue claim, not demonstrated net profit or cash flow |
| 100 applications in about ten minutes | Product demonstration/claim; not verified or implemented as automatic bidding |
| Repeating retainers continue when the operator stops working | Oversimplifies ongoing hosting, delivery, support, churn and maintenance obligations |
| R50,000 monthly progression and $1,000+ projects | Workshop targets; not a financial forecast or delivered project outcome |
| AI-generated or borrowed portfolio pieces | Not adopted as permission to invent experience or claim another party's work |
| No niche required | Historical advice; the built desk records industries/services to support qualification and delivery matching |

A central commercial distinction is revenue versus retained profit versus collected cash. A sale does not establish margin, and invoicing does not establish collection. The product therefore models delivery costs, fees, effort and invoice records rather than displaying workshop income targets as expected outcomes.

The workshop's marketing includes an explicit interest in selling software and coaching. That incentive is relevant to interpreting the material. It is not evidence of misconduct, nor proof that its business method succeeds or fails.

### What was taken into the build

Useful ideas retained are AI-assisted drafting, repeatable delivery, operator-approved proposals, vendor management, retainers and a staged workflow. The app saves drafts for human review and tracks operational records. It does not auto-send outreach, mass-apply to marketplaces, manufacture credentials or automatically engage vendors.

The build does not reproduce the coaching product, Discord community, mentor program, vendor marketplace or claimed client acquisition accelerator. Those are separate workshop offerings and were not delivered as part of this repository.

## 4. Product direction and operating model

The intended loop is:

`Lead → research/audit → offer → outreach draft → call → proposal → won deal → client setup → vendor/task delivery → QA/report → effort/cash/profit review`

The operator controls which prospects to pursue, which claims to send, the scope to quote, the vendor to assign and the payment status to record.

The product direction inferred from the audits is to connect acquisition decisions with the economics of delivery. A generic CRM tracks sales value; this desk also carries vendor costs and operational information. That is a useful design direction, not a proven competitive moat.

The UI separates money, winning work, running work and reference material. Navigation now includes Cash and Effort alongside the earlier desks. The initial data demonstrates plausible operating scenarios; it is fictional and is not a real customer book or proof of revenue.

### Operating safeguards and exact limits

- Outreach and proposals are drafts to copy and review. The app has no external sending integration.
- A won deal can create an onboarding client and task with an unpaid-setup reminder.
- A helper checks whether a setup invoice and the earliest retainer invoice are marked paid.
- That helper is not a universally enforced authorization gate on all task/time mutations.
- Payment flags are manual records, not bank or payment-provider verification.
- Fee and FX assumptions are editable planning inputs, not live market data.
- Margin warnings do not constitute a centrally enforced quote approval system.
- The client portal is an internal preview, not a segregated authenticated client account.

## 5. Historical competitor research and its limitations

The earlier branch compares products across acquisition, proposal/document workflow, profitability, delivery measurement and vendor sourcing. The preserved file calls its scope “twelve platforms,” but it groups multiple products together and names more than twelve individual products. Treat that label as a historical heading, not a precise count of independently tested platforms.

### Consolidated capability comparison

| Product or group named in the earlier audit | Capability considered | Product lesson | Evidence status here |
|---|---|---|---|
| GoHighLevel | Pipelines, acquisition, sub-accounts and white-label resale | Separate operator and client views; evaluate resale only after tenant controls exist | Historical research; no hands-on test |
| HubSpot Sales Hub | CRM, sequences, stage reporting | Track win rate and stage velocity | Historical research |
| Apollo | Prospect data, sequencing and credit costs | Budget acquisition stack costs | Historical research |
| Clay / Instantly | Enrichment and sequencing | Separate data cost from platform cost | Historical grouped comparison |
| Outsource Accelerator Sales Hub | BPO intent signals | Intent may be more useful than company size alone | Historical research; no live data connected |
| PandaDoc / Proposify / Qwilr | Proposal analytics, approval and signature workflows | Quote approval and conversion to payment are gaps | Historical grouped comparison |
| Productive | Effort, budgets, utilisation and profitability | Compare actual costs to assumptions | Historical research; inspired Effort |
| Scoro | Quote-to-cash and service profitability | Connect quotes, time and invoices | Historical research |
| Accelo | Retainers and service delivery management | Retainer burn and collections matter | Historical research |
| Time Doctor / Hubstaff | Time and workforce measurement | Log effort without building surveillance | Historical grouped comparison |
| Upwork / Fiverr | Vendor sourcing and marketplace charges | Fees change landed cost and quote economics | Historical research; presets remain assumptions |

The historical audit records prices from comparison/review sites because the earlier environment reportedly could not read vendor pricing pages. Those price claims were not revalidated during this consolidation. Pricing, plan names and marketplace fees may have changed. The master report preserves those numbers only in the historical appendix, not as purchasing guidance.

Several broad statements in the old material are stronger than its evidence: for example, that no competitor closes a given loop, no service profitability product models a third-party vendor, or Apexline is ahead of every audited tool. This work did not validate those universal claims. A product's features cannot be proven absent merely from an incomplete comparison article.

The engineering lessons are still testable independently of market positioning: actual hours affect hourly cost; fees reduce margin; unpaid invoices are not collected cash; FX assumptions age; backups matter. Those are the concrete gaps addressed in code.

### What the competitor research generated

The earlier checklist identifies twelve proposed additions: actual effort, cash/DSO, vendor capacity, retainer burn, pipeline analytics, quote approval, proposal analytics, signature/payment, white-label portal, intent data, fee drag and stack-cost forecasting.

Of those, the combined build now includes actual effort, basic cash records, fee drag, editable/dated FX and workspace backup. Others remain partial or unfinished. “28 built, 3 partial, 7 missing” is preserved as a historical scorecard count; it is not the final certified score because several historical “built” classifications overstate enforcement.

## 6. Repository and application audit

### Initial state

The local BPOMAX workspace contained only Git metadata and no checked-out application files. The referenced remote contained a README, public assets and a sizeable React/TanStack source tree, but no package manifest, lockfile, Vite configuration or TypeScript project configuration needed for an independent build.

The source imported authentication, error and preview-host components whose referenced implementations were absent. Root metadata included host-specific manifest/icon paths. The documentation described operational protections more strongly than the code implemented them.

### Findings and resolution

| Finding | Effect | Resolution or current status |
|---|---|---|
| Missing project/build setup | Repository could not be run independently | Added package manifest, pnpm lockfile, Vite and TypeScript setup |
| Missing auth provider import | Build failure | Removed unavailable integration; no claim of real authentication |
| Missing preview-host implementation | Build/type failure | Removed obsolete bridge and root usage |
| Missing error UI module | Router imported absent file | Added error component |
| Host-specific asset metadata | References to unavailable preview-host resources | Removed those root links |
| List routes also acting as detail parents | Detail URLs could render the list instead of the record | Explicit Outlet layouts plus separate index routes |
| Lead detail form imported old list filename | Type failure after route split | Updated import to leads.index |
| Audit fallback selected another lead's results | Misleading cross-record display | Latest audit is selected only by the active lead |
| Arbitrary server-side website fetch | Unbounded remote fetching and unclear evidence | Removed; audits use notes plus a reference URL |
| Persisted data loaded after form initialization | Reload could show seeded form values | Load storage before mounting child forms |
| Field labels not associated with inputs | Poor accessibility and testability | Shared Field wrapper associates visible labels with controls |
| Reset/import replaced browser data immediately | Easy accidental workspace loss | Confirmation before replacement; export available |
| FX fixed at 18.2 without a trustworthy date | Planning conversion could look current | Editable rate, dated seed and staleness prompt |
| Hourly vendor always treated as 80h/month | Actual overrun invisible | Quoted-hour fallback plus logged actual hours |
| Vendor/payment fees absent | Optimistic reported margin | Fee profile integrated across quote/client profit calculations |
| Payment fee price gross-up formula | Could miss the requested after-fee margin | Corrected denominator and verified with a domain assertion |
| Only invoice-status enums | No invoice ledger or collection totals | Added invoice entity and Cash desk |
| No export path | Browser storage clearing could erase the operation | Added versioned backup/restore |
| Two active development branches | Split delivery and competing project setups | Combined on main; deleted branch refs after preserving both histories |
| Historical audit overclaims | Could misrepresent validation/completion | Final report explicitly corrects those classifications |

This is an engineering audit of accessible source and observed behavior. It is not a complete review of every edge case, dependency vulnerability, marketplace policy or client contract.

## 7. Build and integration work

### Runnable MVP repair

The original remote source was restored into the workspace. Build dependencies and configuration were added. Missing preview/auth references were removed, root metadata repaired, a usable error screen provided and AI environment variables documented.

The TanStack Start app successfully produced both a client build and a server bundle. The route structure was tested in the browser; the parent/index split was repaired for leads, clients and proposals. Browser persistence was tested with an edited lead note, a save and reload. Test notes were restored after verification.

### Earlier branch preservation

An earlier branch contained additional research and five domain improvements: effort, fee drag, cash, FX and export/import. Rather than deleting that branch's work, its documents and core application changes were inspected and integrated into the runnable configuration.

The combined source uses the current pnpm/Vite setup. The earlier npm lockfile and alternate deployment configuration were not made competing active configurations. Their original contents remain accessible in preserved Git history. Likewise, the historical browser smoke script is preserved in that history; it is not represented as a freshly executed test of the final October build.

### Consolidation-specific refinements

- Added Cash and Effort to navigation.
- Applied fee/actual-cost calculations consistently to dashboard, client list, client detail, Profit and portal preview.
- Kept routing, label and hydration fixes from the runnable branch.
- Added an editable vendor-fee percentage so historical presets are not treated as immutable facts.
- Preserved confirmation before reset and added confirmation before import replacement.
- Stamped the initial FX estimate with 16 September 2026, rather than labelling it as a fresh market observation.
- Corrected the payment-fee pricing denominator.
- Added UI handling for infeasible pricing inputs and chose a feasible default margin when creating a new offer under high processing-fee assumptions.
- Added a reproducible domain validation command.

## 8. Final application inventory

| Route | Purpose and delivered behavior |
|---|---|
| / | Command dashboard: MRR, estimated gross profit, weighted pipeline, due tasks, hot leads and risk lists |
| /profit | Profit desk: client margins, cost flags, fee settings, dated FX and workspace export/import/reset |
| /cash | Invoice ledger, collected/outstanding/overdue amounts, ageing buckets and payment marking |
| /offers | Vendor-cost-based quotes, target margin, SLA, delivery scope, fee effects and optional AI copy |
| /leads | Capture/edit prospects, CSV import, filters, scoring fields and stages |
| /leads/$leadId | Individual lead details, editable fields and linked deal/audit/proposal information |
| /audit | Notes-based prospect assessment and drafts through the optional AI service |
| /pipeline | Deals and stage movement with weighted value |
| /outreach | Human-reviewed channel drafts and job-post proposal drafts |
| /proposals | Proposal list and creation workflow |
| /proposals/$proposalId | Proposal detail, sections and print-oriented view |
| /clients | Client list with fee-aware estimated profitability |
| /clients/$clientId | Client record, vendor/SLA/invoice flags, tasks, QA and reporting |
| /vendors | Vendor profile, rate, skills, availability, NDA/test-task metadata and performance |
| /tasks | Task capture, due dates, priorities and completion |
| /effort | Time entries, quoted/logged hours, overrun flags and margin-at-quote versus actual-cost comparison |
| /qa | Delivery quality reviews tied to clients and vendors |
| /portal | Internal preview of client-visible status, reports and requests |
| /services | Service/niche catalogue for offer selection |
| /templates | Internal operating reference material and scripts |
| /assistant | Optional AI response based on an operator question and workspace snapshot |

There are eighteen top-level page destinations plus three record-detail routes. The three list/detail groups have explicit layout routes whose job is to render an Outlet, not an additional product screen.

Not every row was manually exercised through every action in this session. Successful production compilation covers route loading/module resolution; browser checks and domain tests provide the specific stronger evidence listed below.

## 9. Pricing, profit, effort and cash calculations

### Quote calculation

For standard SLA, delivery price now uses:

`price = vendorCost × (1 + vendorFeePct / 100) / (1 − targetMarginPct / 100 − paymentFeePct / 100)`

The SLA multiplier is applied to the landed vendor cost before dividing. Inputs where target margin plus payment fee reaches 100% are infeasible and rejected.

Example tested: vendor cost $1,500, marketplace fee 10%, payment processing 3%, target margin 50%, standard SLA. Landed vendor cost is $1,650. Quote is $3,510.64. Subtracting landed cost and the 3% payment charge leaves approximately 50% of revenue.

This correction matters because sequentially dividing by (1 − margin) and then (1 − processing fee) does not preserve the requested margin measured against final revenue.

Quote calculation still does not include every possible tool, overhead, fixed marketplace fee, tax, platform minimum, FX spread or onboarding cost. Client profit includes tool and other costs, but the offer model is not a comprehensive tax/accounting model.

### Client profit

`gross profit = monthly client fee − landed vendor cost − tool costs − other costs − payment processing charge`

Margin is gross profit divided by client revenue. This is contribution/gross profit as represented by the desk, not net business profit after owner salary, corporate overhead, tax and every acquisition cost.

### Effort

Monthly vendors retain their monthly rate when hours rise; overrun is a workload, quality and renewal signal. Hourly vendor costs are rate × actual logged hours. If no hours are logged, a quoted-hours fallback is used and the record is flagged unmeasured.

Effort is aggregated by client and calendar month. It is not a timer, attendance system or automated vendor surveillance integration. Logged hours are operator-entered.

### Cash and invoice age

Invoices hold an amount, issue date, due date and optional paid date. Collected totals include invoices with a paid date. Outstanding includes those without one. Overdue includes outstanding invoices whose due date is before the calculation date.

The Cash tile labelled DSO is an unweighted average of invoice issue-to-paid days, with unpaid invoices aged to today. It is a practical invoice-age approximation, not the conventional accounting DSO calculation using receivables and credit sales over a period. Partial payments, credits, refunds, write-offs and reconciliation are not modelled.

The setup-paid helper checks both setup and earliest retainer records. It does not verify money with a bank and is not globally invoked to block all delivery actions.

## 10. Seeded examples and verified numbers

All amounts below are fictional seeded examples, not the user's accounts or real achieved earnings.

| Test scenario | Result |
|---|---|
| Active book monthly recurring revenue | $17,400 |
| Default October fallback-cost gross profit | $10,460 |
| Default gross margin | 60.1149% |
| 10% vendor marketplace fee scenario | GP falls to $9,800; margin 56.3218% |
| Seeded invoices total | $42,500 |
| Seeded invoices marked collected | $29,900 |
| Outstanding at 1 October 2026 | $12,600 |
| Overdue at 1 October 2026 | $12,600 |
| Ageing: 1–30 days late | $9,700 |
| Ageing: over 60 days late | $2,900 |
| Invoice-age approximation | 19.2 days |
| Helios September logged hours | 369h against 360h quoted |
| Oak & Pine September overrun | 12h beyond 100h quoted |
| Oak & Pine September hourly vendor cost | $1,568 |
| Oak & Pine incremental September hourly cost | $168 |
| Fee-aware standard quote example | $3,510.64 at a 50% after-fee target |

The time seed is September 2026. The current October Effort page therefore initially shows no October hours logged. That is a correct period distinction, not evidence that September time disappeared. Historical September overrun tests explicitly select September. MRR is a contract/retainer view; invoice totals cover several months and must not be compared as if they were the same period.

A reset seeds fictional invoices and time entries. Older browser workspaces receive defaults for newly introduced state fields when absent. Such defaults are demo data, not recovered production data. An operator importing a real book must inspect the ledger and remove/replace seeded examples before relying on totals.

## 11. Architecture and data model

| Layer | Implementation |
|---|---|
| UI | React 19, reusable components and Lucide icons |
| Routing/server functions | TanStack Router and TanStack Start |
| Styling | Tailwind CSS 4 with an existing dark visual system |
| State | Zustand |
| Persistence | Browser localStorage, plus JSON workspace export/import |
| Build | Vite 7 and pnpm lockfile |
| Type checks | TypeScript |
| AI calls | Server-side xAI-compatible chat-completions request |
| Business calculations | money.ts and store.ts |
| Domain checks | scripts/validate-domain.mjs |

Domain entities include Lead, Deal, Offer, Vendor, Client, Task, QaReview, Proposal, Activity, ClientRequest, ClientReport, OutreachDraft, AuditResult, TimeEntry and Invoice. Workspace settings include FX rate/date, fee profile and portal selection.

The browser contains the business workspace. The server supplies pages and optional AI functions; it does not hold a shared customer database. Two devices do not automatically share edits. A different localhost port is a different browser storage origin and may display a fresh workspace.

The public GitHub repository holds source code, fictional seed data and documentation. It does not receive the operator's browser workspace on every edit. Exported production workspaces are not automatically committed.

## 12. Data persistence, migration, backup and import

The persistence key is apexline-os-v1. Storage loading is delayed until client startup, and the app shell waits before rendering child forms. This avoids initializing forms from server/demo values while saved data loads.

Workspace export uses format apexline.workspace, version 1, an exported timestamp and persisted state. The same persisted-state definition drives storage and export, reducing omission risk. Import checks JSON syntax, format, version, state object and a set of required collection arrays before replacement. Domain tests verify a normal round trip and rejection of malformed/wrong-format/wrong-version files.

Import validation is not a complete schema validator for every nested field. It should be strengthened before imports from untrusted parties or production use. It does not perform row-by-row referential integrity checks, cryptographic validation, backup encryption or exhaustive migration.

Export first before imports, resets, browser clearing or device changes. Reset and import replacement now prompt, but the app has no general undo/history or cloud recovery service. Keep exported real workspaces outside the public source repository.

## 13. AI integration and its boundaries

Server functions exist for audit, outreach, proposal, freelance job draft, assistant and offer-copy generation. Credentials use XAI_API_KEY and model selection uses XAI_MODEL. The environment template supplies no secret. Keys must remain server variables, never VITE_-prefixed browser variables.

Without credentials, AI actions return an unavailable result. Existing seeded drafts and manual operations remain accessible. This work did not supply a key or exercise paid live generation.

Audits use company, notes and a reference URL. The server no longer fetches arbitrary user-supplied websites. Any extracted-page text placeholder is empty; the result must not be described as an independently crawled website audit.

Generated material needs review. The prompts request structured JSON in some flows, but generation is not a guarantee of correct JSON, accurate business facts, lawful terms, feasible SLAs or correct pricing.

Known limitations include shallow input validators, no tenant authentication, no provider rate limiting, no comprehensive timeout/retry policy and incomplete handling of network/provider errors in some UI flows. Before public hosting, those issues need server-side controls. Do not expose an unrestricted AI endpoint with a paid key.

## 14. Validation and evidence ledger

| Check | Result and scope |
|---|---|
| TypeScript noEmit | Passed on consolidated source |
| Vite client build | Passed |
| Vite server build | Passed |
| Domain validation command | Passed |
| Seeded cash totals | Asserted: invoiced, collected, outstanding, overdue and ageing |
| Payment movement | Marking an unpaid invoice paid raises collected and lowers outstanding by its amount |
| September effort | Asserted Helios hours and Oak & Pine overrun |
| Actual hourly vendor cost | Asserted $1,568 for Oak & Pine September |
| Setup predicate | Asserted a paid setup/first-retainer example and an unpaid example |
| Quote calculation | Asserted standard quote and target margin with vendor/payment fees |
| Infeasible quote input | Asserted rejection |
| Fee drag | Asserted GP decreases when vendor fees rise |
| Workspace export/import | Asserted versioned payload and round trip |
| Invalid import files | Asserted rejection of invalid JSON, wrong format and wrong version |
| Dashboard in browser | Observed populated demo and risk/P&L panels |
| Lead detail in browser | Observed record form after routing repair |
| Lead edit/reload | Observed saved note load after storage-first startup; original note restored |
| Client list | Observed expected populated route |
| Consolidated Profit page | Observed fee settings, FX, export/import controls and invoice-derived overdue flags |
| GitHub default/visibility | Public repository, default main |
| GitHub branch cleanup | Exactly one branch, main |
| PR disposition | Both original PRs closed and merged |
| Live AI | Not tested |
| Public hosted application | Not provisioned or tested |
| Full security/accessibility audit | Not conducted |

The new domain script compiles domain modules to an ignored validation directory and runs assertions without a browser, real API credentials or production data. A small storage shim permits the export/import/persistence functions to execute in the test runtime.

The old branch's browser smoke script contains broader claims about cold/warm route sweeps and screenshots. Those are historical test artifacts, not a new October test result. In particular, it assumes current-month September seed activity and should be updated before being used unchanged in October.

Successful builds do not prove business accuracy for all imported states. Domain tests establish selected calculations and transitions. Browser observations establish the specific visible flows; no claim is made that every screen action has been exhaustively tested.

## 15. GitHub publication and branch consolidation

### Before

- main at 19bc297029ce7d3cef5a87128d0149c8e6a3a211.
- Earlier research/features branch at 88e0fcdcf6122b018620813c1dc8d04b02a3a12c.
- Runnable MVP branch at 28eba24ebc13704ee26caf1b66fd633362b12669.
- Two open PRs and overlapping alternative configurations.

### Consolidation

A combined tree was published in a commit with the original main and both working tips as parents. This retains complete commit history while selecting one coherent active application configuration and combining relevant features and documents.

main was advanced without force-rewriting existing history. After that publication, the two redundant branch references were deleted. GitHub then returned one branch and no open PRs. Both PRs were confirmed merged.

The sole remaining branch is main. Historical branch names appearing in this report or in old PRs are provenance, not extra live branches. Commit history remains available; deleting redundant refs did not discard the earlier commits.

The final documentation publication adds this master report and the README download entry directly to main. No new working branch is required.

### Meaning of deployment in this report

“Published to GitHub” means repository source/documents are publicly accessible. It does not mean a cloud application server, database, custom domain, payment provider, authentication service or monitoring stack has been deployed. A future server deployment must be a separate, explicitly configured hosting step.

The build has server-side functions. Simply putting static client files on GitHub Pages would not reproduce the full server/AI behavior. No successful GitHub Pages or other cloud deployment is claimed.

## 16. How to download, install and operate the project

### Download the report

Open MASTER_REPORT.md from the repository README. GitHub's raw/download file control gives a standalone Markdown copy. The README also includes a direct raw-file download link. This file includes all three major historical research documents as appendices so it remains useful without opening multiple docs.

### Download or clone code

Use GitHub's Code menu to download the repository ZIP, or:

~~~sh
git clone https://github.com/logiagenesis/bpo.git
cd bpo
pnpm install
pnpm dev
~~~

Use a Node.js version compatible with the locked dependencies; this build was verified using the bundled runtime and the README specifies Node 22.12+. The lockfile records the exact tested package resolutions. pnpm-workspace.yaml permits the esbuild package's build step.

Open the local URL printed by Vite. The usual default is http://127.0.0.1:5173. If that port is busy, Vite may choose another port. A port change changes localStorage origin; export and import if moving existing work between origins.

### Check the project

~~~sh
pnpm check
pnpm validate
pnpm build
~~~

check runs TypeScript, validate checks the domain calculations and workspace round trip, and build produces client/server output. Production hosting requires an appropriate server adapter/runtime and environment settings, not just a static upload.

### Start operating

1. Explore the fictional seeded workspace and confirm the labels and calculations.
2. Set an operator-supplied FX estimate and fee assumptions from actual contracts.
3. Add or import real prospects and enter the known business evidence.
4. Create a scope and quote from deliverable capacity and landed costs.
5. Draft, review and manually send outreach/proposals.
6. Record a won deal and confirm the chosen offer/vendor rather than relying on automatic defaults.
7. Create setup/retainer invoices and record cleared payment accurately.
8. Track work, QA, hours, reports and requests.
9. Review estimated margin alongside collection and invoice age.
10. Export a backup regularly.

This is an operational workflow, not a guarantee of clients or income.

## 17. What remains unfinished

### Production and security

Authentication, tenant isolation, a shared persistent server database, authorization, production deployment adapter, secret-management configuration, rate limiting, complete input schemas, import schemas, monitoring, backups, recovery and security tests are unfinished.

No live customer data was migrated. No bank/payment reconciliation, e-signature, legally reviewed contract terms or automated invoice delivery was implemented.

### Finance and reporting

- Quote-level tool costs and full overhead/tax/fixed-fee model.
- Partial payments, write-offs, credits, refunds and accounting exports.
- Standard accounting DSO and period-consistent revenue/cash views.
- Per-client/per-vendor fee profiles instead of only workspace-wide assumptions.
- Historical month selector on Effort and margin drift trends.
- Renewal dates, lifetime gross profit, churn/LTV and cohort metrics.
- Vendor capacity/utilisation roll-up.
- Win rate by source/service and stage velocity.
- Persistent pricing approval record and hard floor enforcement.

### Operational correctness

- Payment gating helper is not applied as a universal mutation restriction.
- Vendor choice on a new won client can default rather than enforcing skill/capacity matching.
- Lead source is stored but acquisition cost per won client is not fully derived.
- Duplicate filtering is basic; within-batch duplicates and normalized contact identity deserve further checks.
- Client status/invoice enums can diverge from invoice-derived cash flags on some screens.
- Some edits/imports lack deeper referential checks.
- Dates use UTC ISO helpers in the source; business-local midnight behavior deserves a SAST-specific design review.
- The effort page focuses on the current calendar month; historical seeds are not current operational activity.
- Seeded defaults on older workspaces must be identified as demo additions.

### UX and AI

Form labels were improved, but a full keyboard/focus/dialog/mobile accessibility audit was not completed. Some nested link/button patterns and custom-dialog focus behavior remain to review. Provider failures and malformed generated outputs need stronger end-to-end handling.

## 18. Recommended next work

| Priority | Work | Why |
|---|---|---|
| 1 | Separate clean operational workspace from demo data; strengthen import schemas and backup recovery | Prevent misleading balances and data loss |
| 2 | Authentication, tenant isolation and server persistence | Necessary before sharing the working application with clients/operators |
| 3 | Apply payment, quote-margin and vendor-capacity rules in domain mutations | Turn reminders into enforceable controls |
| 4 | Period-aware effort, cash and profitability reporting | Make comparisons operationally reliable |
| 5 | Complete quote costs and per-client fee settings | Protect actual margin |
| 6 | Provider error/timeout/rate-limit handling and structured output validation | Make optional AI robust |
| 7 | Deployment adapter, staging checks and monitored public hosting | Produce a real live application link |
| 8 | Renewal, churn, capacity and pipeline analytics | Improve decisions once base records are trustworthy |
| 9 | Reverify competitor capabilities/prices with primary sources | Support defensible commercial positioning |

This is a proposed build order derived from current gaps, not evidence that the remaining work has already been completed.

## 19. File map and provenance

| File or directory | Role |
|---|---|
| MASTER_REPORT.md | This standalone master report |
| README.md | Single repository landing page and report download entry |
| docs/checklist.md | Preserved earlier product checklist |
| docs/competitor-audit.md | Preserved historical market comparison with source links |
| docs/scorecard.md | Preserved historical assessment; final corrections are in this report |
| package.json / pnpm-lock.yaml | Active dependency definition and locked resolutions |
| pnpm-workspace.yaml | Allowed esbuild package build step |
| vite.config.ts / tsconfig.json | Active build and type configuration |
| .env.example | Optional server-only AI variable template; no secrets |
| src/components | Shared shell, labels, dialogs, buttons, stats and display components |
| src/routes | Product pages, explicit layouts and record details |
| src/lib/types.ts | Domain entities and enumerations |
| src/lib/seed.ts | Fictional demonstration records, including historical September activity |
| src/lib/money.ts | Quotes, fees, effort, cash/age and profit calculations |
| src/lib/store.ts | Workspace mutations, persistence, backups and derived KPIs |
| src/lib/ai.functions.ts | Optional server AI request functions |
| scripts/validate-domain.mjs | Reproducible selected domain checks |
| public | Repository public assets; original binary OG asset retained on GitHub |

node_modules, dependency caches, local build output, temporary validation output, .env secrets and browser workspace exports are not repository deliverables. “Everything pushed” means the project source, active configuration, retained research and master documentation, not generated caches or private runtime state.

### Provenance record

| Source snapshot | Purpose |
|---|---|
| 19bc297029ce7d3cef5a87128d0149c8e6a3a211 | Original repository main source |
| 88e0fcdcf6122b018620813c1dc8d04b02a3a12c | Earlier research, cash, effort, fees, FX and backup work |
| 28eba24ebc13704ee26caf1b66fd633362b12669 | Runnable MVP, routing/hydration repair and build setup |
| 536415c24bda1f17b0966ae3c281404f95d16cd2 | Combined main source with both prior histories retained |
| Commit containing this report | Final documented publication snapshot |

## 20. Historical research appendices

The following appendices reproduce the earlier repository research so this single Markdown file is complete. They are historical source text, not newly verified market research. Their pricing, competitor exclusivity claims, test statements and completion counts retain the limitations described above.

The final assessment in sections 1–19 takes precedence where the old material says payment gating, margin blocking, every quoted figure or competitive superiority is already proven.


---

# Appendix A — Historical product checklist

**Historical snapshot:** earlier branch 88e0fcdcf6122b018620813c1dc8d04b02a3a12c. Source file: docs/checklist.md. Read with the qualifications in the main report.

# The profit checklist

What a profit-first BPO desk must do. Written before the competitor audit, then
extended by it — the [Stolen](#stolen-from-the-audit) section lists capabilities
that came out of auditing other platforms rather than out of our own heads.

Every line answers one question: **does this move margin, cash, keep, or risk?**
If it does not, it does not belong in Apexline.

## 1. Find

- [ ] Capture leads from any source into one list (CSV, manual, paste)
- [ ] Score a lead on signals that predict *paying*, not signals that predict *replying*
- [ ] Rank the list so the operator works the top, not the newest
- [ ] Deduplicate on company + contact so the same prospect is not worked twice
- [ ] Record where a lead came from, so cost per won client is knowable later

## 2. Qualify

- [ ] Audit a prospect against the services we can actually deliver
- [ ] Identify the pain that has a budget attached, not the pain that is interesting
- [ ] Disqualify fast and say why — a dead lead that stays open costs attention
- [ ] Flag prospects whose work we cannot source a vendor for

## 3. Price

- [ ] Build the offer from **vendor cost up**, never from a market rate down
- [ ] Enforce a floor margin; block or warn below it
- [ ] Model SLA as a cost multiplier, because faster response costs vendor capacity
- [ ] Include tool cost, platform fees, and payment fees in the quoted margin
- [ ] Show the quote in both the client's currency and ZAR at a dated FX rate

## 4. Win

- [ ] Draft outreach and proposals; the operator sends them
- [ ] Track the deal through named stages with a probability per stage
- [ ] Weighted pipeline value, so forecast is not wishful
- [ ] Know win rate by source, service, and price band
- [ ] Know how long a deal sits in each stage before it rots

## 5. Deliver

- [ ] Assign a vendor with a rate, a skill match, and real capacity
- [ ] Never start vendor work before setup + month 1 is marked paid
- [ ] Track effort actually spent against effort quoted
- [ ] QA score per delivery cycle, tied to the vendor and the client
- [ ] Client-visible status without exposing the vendor

## 6. Get paid

- [ ] Invoice records with amount, issue date, due date, paid date
- [ ] Cash collected vs revenue invoiced — they are not the same number
- [ ] Days sales outstanding, per client and overall
- [ ] Overdue escalation before the vendor's next payment falls due

## 7. Keep

- [ ] Retention economics: churn rate, client lifetime, lifetime gross profit
- [ ] CSAT or an equivalent early-warning signal
- [ ] Renewal and price-review dates surfaced before they pass
- [ ] At-risk flagging that fires on leading indicators, not on the churn itself

## 8. Prove

- [ ] Gross profit and margin per client, per vendor, per service
- [ ] Margin drift over time, not just margin today
- [ ] Alert when actual effort pushes a client below the floor margin
- [ ] Export everything — the operator's data is theirs and must survive the app

## Stolen from the audit

Capabilities the audit surfaced that were **not** in the list above until other
platforms were examined. See [competitor-audit.md](./competitor-audit.md).

| # | Capability | Taken from | Why it makes money |
|---|---|---|---|
| 1 | Actual effort vs quoted effort | Productive, Scoro, Accelo, Time Doctor | Scope creep is the silent margin killer. A flat monthly vendor cost hides it entirely. |
| 2 | Cash collection and DSO | Scoro, Accelo, Productive | Gross profit that never lands in the bank is a rounding error with good manners. |
| 3 | Vendor utilisation and capacity | Productive, Scoro | Tells you whether you can sign the next client without hiring. |
| 4 | Retainer burn-down | Productive, Accelo | Shows mid-month when a retainer is being over-served, while it is still fixable. |
| 5 | Win rate and pipeline velocity by segment | HubSpot, Pipedrive | Tells you which niche to work and which to drop. |
| 6 | Margin approval gate on quotes | Scoro, Proposify, PandaDoc | Stops the operator discounting past the floor under closing pressure. |
| 7 | Proposal open/read analytics | PandaDoc, Qwilr, GetAccept | Tells you when to follow up and which section lost the deal. |
| 8 | E-signature and pay-now on accept | PandaDoc, GetAccept | Compresses "won" to "cash" — the gap where deals die. |
| 9 | White-label client portal | GoHighLevel | Lets the desk be resold, and keeps the vendor invisible. |
| 10 | Outsourcing-intent signals | Outsource Accelerator Sales Hub | Buying intent beats firmographics for this specific service. |
| 11 | Platform and payment fee drag in the quote | Upwork, Fiverr fee schedules | A quote priced at 50% margin sourced through a marketplace does not deliver 50%. |
| 12 | Forecast the cost of our own stack | Apollo credits, HubSpot onboarding | Seat and credit costs scale with the desk and eat the margin they helped create. |


---

# Appendix B — Historical competitor audit

**Historical snapshot:** earlier branch 88e0fcdcf6122b018620813c1dc8d04b02a3a12c. Source file: docs/competitor-audit.md. Read with the qualifications in the main report.

# Competitor audit — September 2026

Twelve platforms, audited against [the checklist](./checklist.md). The question
is not "which is best" but "what does each one know about making money that
Apexline does not".

## Evidence quality — read this first

This environment's network egress blocks vendor websites, so **no price below was
read off the vendor's own pricing page.** Every figure comes from third-party
comparison and review sites retrieved via web search in September 2026, and is
listed with the source that stated it. Prices move, tiers get renamed, and
comparison sites are frequently affiliates of the products they compare.

**Confirm any number here against the vendor's own pricing page before you make a
commercial decision on it.** Where a vendor hides pricing (Accelo, Outsource
Accelerator Sales Hub), that is noted rather than guessed at.

## The four categories

The platforms sort into four groups, and the gap between groups is the whole
opportunity:

| Group | Platforms | Runs from | Stops at |
|---|---|---|---|
| **Acquisition** | GoHighLevel, HubSpot, Apollo, Clay/Instantly | cold list | "won" |
| **Paper** | PandaDoc, Proposify, Qwilr | quote | signature |
| **Profitability** | Productive, Scoro, Accelo | "won" | invoice |
| **Delivery proof** | Time Doctor, Hubstaff | assigned work | timesheet |
| **Supply** | Upwork, Fiverr | vendor search | vendor payment |

Acquisition tools stop at the moment work begins. Profitability tools start
there — but assume the people doing the work are *your employees*, on your
payroll, with your utilisation targets. None of them model a third-party vendor
whose cost is the input to your price.

**Nobody closes the loop from "price the deal" to "prove the margin landed in
cash."** That join is Apexline's entire reason to exist.

## The teardown

### Acquisition

**GoHighLevel** — agency client-acquisition CRM. Pipelines, funnels, email/SMS
automation, unlimited sub-accounts, and full white-label resale ("SaaS Mode") so
an agency can rebrand the platform and bill clients through Stripe with its own
markup. Listed at $97 (Starter), $297 (Unlimited), $497 (Agency Pro) per month
([GHL Experts](https://www.ghlexperts.com/gohighlevel-plans-pricing),
[Automize](https://getautomized.com/gohighlevel-pricing/)).
*Does not do:* any supplier side. No vendor, no cost of delivery, no margin per
client. It will happily help you sell work you lose money delivering.
**Steal:** sub-account white-label portal, and the resale model itself.

**HubSpot Sales Hub** — the CRM benchmark. Clean pipeline, sequences, reporting.
Starter around $20/seat/month; Professional around $100/seat/month plus a stated
$1,500 onboarding fee, with sequences, automation and reporting gated at
Professional and quoting sold as an add-on
([Docket](https://www.docket.io/resources/research/hubspot-sales-hub-pricing),
[MarketBetter](https://marketbetter.ai/blog/hubspot-sales-hub-pricing/)).
*Does not do:* cost of delivery. A HubSpot deal has a value, never a margin.
**Steal:** stage-level conversion and velocity reporting.

**Apollo.io** — lead database plus sequencer plus dialer in one seat. Reported at
$49–$119/user/month annually ($59–$149 monthly), on a credit model where unused
credits expire at month end rather than rolling over
([Salesmotion](https://salesmotion.io/blog/apollo-pricing),
[Saleshandy](https://www.saleshandy.com/blog/apolloio-pricing/)).
*Does not do:* qualification against what you can actually deliver.
**Steal:** nothing structural — but note the expiring-credit model as a cost that
scales with desk activity and must be forecast.

**Clay / Instantly** — enrichment and sequencing. Clay reportedly from $185/month
(Launch) and $495/month (Growth), splitting platform "Actions" from marketplace
"Data Credits", and cannot send email itself; Instantly's Starter bundle is
reported at $94/month ([Salesmotion](https://salesmotion.io/blog/apollo-pricing)).
*Does not do:* anything after the reply.
**Steal:** the separation of platform cost from data cost — useful framing for
modelling our own stack cost.

**Outsource Accelerator Sales Hub** — the only audited tool built specifically for
BPO sellers. Filters prospects across 50+ data points against 10M+ verified
contacts, and sells **real-time outsourcing-intent data** rather than static
firmographics — businesses actively exploring outsourcing right now
([Outsource Accelerator](https://www.outsourceaccelerator.com/articles/sales-intelligence-platforms-for-bpos-vs-generic-lead-tools/)).
Pricing is not published; it is gated behind a request.
*Does not do:* pricing, delivery, margin.
**Steal:** intent as a first-class lead-score input, weighted above company size.

### Paper

**PandaDoc / Proposify / Qwilr** — proposals, e-signature, approval workflows and
document analytics (who opened it, which section they lingered on). Reported at
PandaDoc Essentials $19 / Business $49 per seat/month; Proposify Basic $29 /
Team $49 per user/month; Qwilr Business $35/seat/month with Enterprise $59 at a
five-seat minimum
([Proposify on PandaDoc](https://www.proposify.com/blog/pandadoc-pricing),
[comparison](https://saas-tools.medium.com/pandadoc-vs-proposify-vs-qwilr-which-proposal-tool-is-worth-your-budget-in-2026-8e8339d6ab87)).
Proposify is noted for the tightest approval control, Qwilr for presentation.
*Does not do:* know what the work costs you.
**Steal:** approval gates on discount, open/read analytics, and pay-on-accept.

### Profitability — the category the earlier research missed

This is the group that matters most and was absent from the prior notes in the
Drive folder.

**Productive.io** — agency operating system built around profit per project and
per client: budgets, actual vs estimated time, utilisation, and recurring-revenue
tracking. Reported at roughly $10–$25/user/month depending on tier
([Noloco](https://noloco.io/blog/productive-vs-scoro),
[AgencyHandy](https://www.agencyhandy.com/client-portal/productive-io-pricing/)).

**Scoro** — quote-to-cash for professional services: quoting with margin visible
at quote time, then time, billing and profitability on the same record. Reported
from about $19.90/user/month (Core, annual) up to about $49.90 (Performance)
([Scoro comparison](https://productive.io/blog/scoro-vs-accelo/),
[GoodDay](https://www.goodday.work/blog/best-scoro-alternatives/)).

**Accelo** — client-work management with retainer burn-down and profitability.
Pricing was removed from the public site after its 2024 acquisition; third parties
cite figures from $20/user/month upward, which should be treated as unreliable
([Productive](https://productive.io/blog/scoro-vs-accelo/)).

*What all three do that Apexline does not:* they treat **quoted margin as a
hypothesis and actual margin as the result**, and they show you the gap while
there is still time to act on it.
*What none of them do:* model a third-party vendor as the cost base, or do any
client acquisition. They assume you already have the client and the staff.
**Steal:** actual-vs-quoted effort, retainer burn-down, utilisation, and margin
drift over time.

### Delivery proof

**Time Doctor** — activity monitoring, distraction alerts, app/website usage and
payroll reporting; explicitly popular with BPO firms. Reported from $6.67/user/month
(Basic, annual), $11.67 (Standard), $16.70 (Premium)
([Timely](https://www.timely.com/blog/time-doctor-vs-hubstaff/),
[G2](https://www.g2.com/products/time-doctor/pricing)).

**Hubstaff** — workforce management: time, GPS, screenshots, project budgets,
payroll. Reported at $4.99 (Starter), $7.50 (Grow), $10 (Team) per user/month
([Hubstaff comparison](https://hubstaff.com/blog/timedoctor-review/),
[Everhour](https://everhour.com/blog/time-doctor-vs-hubstaff/)).

*Does not do:* pricing or client-side anything.
**Steal:** hours as the unit that converts a vendor rate into a real cost. Note
that surveillance-grade monitoring is the wrong tool for a vendor relationship —
we want *effort logged against a retainer*, not screenshots.

### Supply — and the fee drag nobody models

**Upwork** — since May 2025 a variable freelancer service fee of 0–15% per
contract, with clients on the Basic plan paying a 5% marketplace fee (3% for
eligible US clients paying by bank), Business Plus clients 10% (8% eligible), plus
a one-time contract initiation fee of $0.99–$14.99
([Upwork support](https://support.upwork.com/hc/en-us/articles/211062538-Learn-about-the-Freelancer-Service-Fee),
[GoLance breakdown](https://golance.com/blogs/upwork-fees-explained-2026)).

**Fiverr** — a flat 20% seller commission on every order and tip, plus a buyer
service fee reported at 5.5% and $3.50 on orders under $100
([comparison](https://bestjobsearchapps.com/articles/en/upwork-vs-fiverr-which-freelance-platform-saves-more-on-fees-in-2026)).

**This is the finding with the sharpest edge.** If vendor work is sourced through
a marketplace, between roughly 5% and 25% of the transaction disappears in
platform fees before anyone has done anything wrong. A quote built to a 50% margin
on raw vendor cost does not deliver 50%. Apexline's pricing engine currently
ignores fees entirely, which means **every margin figure the app shows is
optimistic by the size of the fee** whenever marketplace sourcing is used.

## Where this leaves Apexline

| Checklist area | Best-in-class | Apexline today |
|---|---|---|
| Find | Apollo, OA Sales Hub | has capture + scoring; no intent data |
| Qualify | — (nobody does this well) | **ahead** — audit against deliverable services |
| Price | Scoro | **ahead** on cost-up pricing; behind on fee drag |
| Win | HubSpot, GoHighLevel | has stages + weighted pipeline; no velocity or win-rate analytics |
| Deliver | Productive, Time Doctor | has vendor assign + QA; **no effort tracking at all** |
| Get paid | Scoro, Accelo | **nothing** — a single status enum, no invoices, no cash |
| Keep | Productive | has CSAT + at-risk; no churn, LTV or renewal dates |
| Prove | Productive, Scoro | margin per client today; no drift, no actuals, no export |

Apexline is genuinely ahead on the front half — cost-up pricing with a margin
floor is something none of the acquisition tools do, and the qualification step
is better than anything audited. It is behind on the back half, and the back half
is where the money is actually kept.

Scored in detail in [scorecard.md](./scorecard.md).


---

# Appendix C — Historical code scorecard

**Historical snapshot:** earlier branch 88e0fcdcf6122b018620813c1dc8d04b02a3a12c. Source file: docs/scorecard.md. Read with the qualifications in the main report.

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

---

End of master report. Final verified repository branch: main. Public application hosting remains unprovisioned.
