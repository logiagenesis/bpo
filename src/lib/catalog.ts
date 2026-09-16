import type { Niche, ServiceType } from "./types";

export const NICHES: Niche[] = [
  {
    id: "appointment_setting",
    demand: "high",
    difficulty: "medium",
    typicalClientUsd: 4200,
    typicalVendorUsd: 1600,
    skills: "CRM discipline, calendar, English, objection handling",
    pitch: "We book 20–40 qualified sales conversations a month so your closers only talk to people who asked for the call.",
  },
  {
    id: "inbound_support",
    demand: "high",
    difficulty: "medium",
    typicalClientUsd: 6500,
    typicalVendorUsd: 2400,
    skills: "Helpdesk, product knowledge, CSAT, written English",
    pitch: "First-response under 15 minutes, tickets closed to SLA, so your team stops drowning in the inbox.",
  },
  {
    id: "lead_generation",
    demand: "high",
    difficulty: "high",
    typicalClientUsd: 3800,
    typicalVendorUsd: 1400,
    skills: "Research, Clay/Apollo-style ops, copy, list hygiene",
    pitch: "A weekly list of verified decision-makers plus first-touch drafts. You approve. Nobody sprays.",
  },
  {
    id: "admin_va",
    demand: "medium",
    difficulty: "low",
    typicalClientUsd: 2200,
    typicalVendorUsd: 900,
    skills: "Inbox, calendar, docs, follow-through",
    pitch: "A named operator on your tools, covering the admin that currently steals founder hours.",
  },
  {
    id: "bookkeeping",
    demand: "medium",
    difficulty: "high",
    typicalClientUsd: 1800,
    typicalVendorUsd: 700,
    skills: "Xero/QBO, reconciliations, month-end pack",
    pitch: "Clean books by the 10th. You see the pack. Your accountant stops chasing receipts.",
  },
  {
    id: "social_media",
    demand: "medium",
    difficulty: "medium",
    typicalClientUsd: 2500,
    typicalVendorUsd: 950,
    skills: "Content ops, design brief, scheduling, reporting",
    pitch: "12 approved posts a month, scheduled, reported. You keep the voice. We keep the cadence.",
  },
  {
    id: "data_entry",
    demand: "low",
    difficulty: "low",
    typicalClientUsd: 1200,
    typicalVendorUsd: 480,
    skills: "Accuracy, speed, sheet discipline, QA sample",
    pitch: "Backlog cleared to a documented error rate. Cheap only if the QA is real.",
  },
  {
    id: "recruitment",
    demand: "medium",
    difficulty: "high",
    typicalClientUsd: 3000,
    typicalVendorUsd: 1100,
    skills: "Sourcing, screening calls, scorecards",
    pitch: "A shortlist of 5 screened candidates a month against a scorecard you signed.",
  },
  {
    id: "web_fulfilment",
    demand: "high",
    difficulty: "high",
    typicalClientUsd: 5000,
    typicalVendorUsd: 1800,
    skills: "Scoped builds, staging, QA, change control",
    pitch: "Scoped site or app work delivered by a vetted builder. You own the client. We own the ticket.",
  },
  {
    id: "chat_email_support",
    demand: "high",
    difficulty: "medium",
    typicalClientUsd: 4800,
    typicalVendorUsd: 1700,
    skills: "Live chat, macros, tone match, escalation",
    pitch: "Coverage across their trading hours. Escalations only when the playbook says so.",
  },
];

export function nicheById(id: ServiceType) {
  return NICHES.find((n) => n.id === id)!;
}

export const BIBLES: { id: string; title: string; blurb: string; body: string }[] = [
  {
    id: "offer",
    title: "Offer bible",
    blurb: "Sell an outcome. Price from cost.",
    body: `Never quote labour. Quote a number the buyer can take to their board.

Rules
1. Name the outcome (calls booked, tickets closed, lists delivered).
2. Cost the vendor and tools before you speak a price.
3. Target 45–60% gross margin. Below 40% needs a reason in writing.
4. Setup fee covers onboarding. First month in advance. Work starts when funds clear.
5. One niche, one ICP, one retainer shape until you have three case studies.

Pricing shapes
- Monthly retainer (default)
- Per seat
- Per qualified appointment
- Per ticket bundle
- Outcome bonus on top of a floor

If you cannot write the SLA in eight lines, the offer is not ready.`,
  },
  {
    id: "acquire",
    title: "Client acquisition bible",
    blurb: "Find, audit, pitch, follow up.",
    body: `ICP: overseas firms, 11–200 staff, a messy inbox or empty calendar, English-speaking buyer.

Channels that pay
- Warm intros
- Job boards (you paste the brief, Apexline drafts, you send)
- LinkedIn to the operator, not the brand page
- Website audits sent as a one-page diagnosis

Do not
- Mass-bid
- Let a model hit send
- Pitch “cheap VAs”

Sequence: research → audit → first note → bump at day 3 and 7 → call → proposal → close. Log the reason when you lose.`,
  },
  {
    id: "proposal",
    title: "Proposal bible",
    blurb: "Pain, path, price, proof, next step.",
    body: `Every proposal has the same spine:
1. The problem in their words
2. The outcome and how we will measure it
3. Deliverables and what is out of scope
4. Timeline and onboarding
5. Price, setup, payment terms
6. SLA and reporting cadence
7. One next step (sign + pay)

Keep it to 3–5 pages. No stock photography. Attach one relevant proof or a sample dashboard.`,
  },
  {
    id: "vendor",
    title: "Vendor bible",
    blurb: "Vet hard. Always have a backup.",
    body: `Before a vendor touches a client:
- Paid test task with a scorecard
- NDA
- Time-zone overlap check
- Written SOP they can execute without you
- Backup vendor named on the client record

Never let the vendor speak to the client unless you have approved the channel. You own the relationship. They own the tickets.`,
  },
  {
    id: "ops",
    title: "Operations bible",
    blurb: "Onboard once. Repeat the week.",
    body: `Onboarding (week 0)
- Access list, SOP, SLA, reporting template, escalation path
- First deliverable in 5 working days

Weekly loop
Mon: plan + risk scan
Wed: QA sample
Fri: client report and invoice check

Escalate on the first miss, not the third.`,
  },
  {
    id: "qa",
    title: "QA bible",
    blurb: "Score it or it did not happen.",
    body: `Sample 10% of output or 5 items, whichever is larger.

Score 0–100. Below 80 is a coaching note. Below 70 is a PIP. Two PIPs and the vendor is rotated.

Log mistakes as patterns, not personalities. The client sees the number. They stay when they can see the number.`,
  },
  {
    id: "profit",
    title: "Profit bible",
    blurb: "If it does not move margin, it is a hobby.",
    body: `Every feature in this desk exists to: get a client, close a client, keep a client, cut cost, cut risk, or raise price.

Watch
- Client margin
- Overdue invoices
- Vendor under-score
- SLA breach count
- Forecast vs actual

Churn starts as silence. If a client has not opened a report in 14 days, they are at risk.`,
  },
];

export const SCRIPT_TEMPLATES: { id: string; kind: string; title: string; body: string }[] = [
  {
    id: "email-1",
    kind: "Cold email",
    title: "Audit first note",
    body: `Subject: a 12-minute read on {{company}}'s {{pain}}

{{firstName}} — I went through {{website}} this morning.

The gap: {{pain}}. That usually costs you {{cost}} a month in lost {{outcome}}.

We run {{service}} for firms like yours: {{proof}}.

If I sent a one-page plan with price and SLA, would you look at it this week?

{{sender}}
Apexline`,
  },
  {
    id: "li-1",
    kind: "LinkedIn",
    title: "Operator note",
    body: `{{firstName}} — not pitching tools. Looked at {{company}}. {{pain}} is showing up on the site/reviews.

We take that function off your plate and report weekly. Open to a 12-min look this week?`,
  },
  {
    id: "call-1",
    kind: "Call script",
    title: "Discovery",
    body: `1. Confirm time. One sentence on who you are.
2. “What does a good month look like for {{function}}?”
3. Volume, tools, who does it today, what breaks.
4. Reflect the cost of the break.
5. Offer the outcome + SLA, not the people.
6. Book the proposal review. Do not price on the first call unless they insist — then floor from vendor cost.`,
  },
  {
    id: "obj-1",
    kind: "Objections",
    title: "We already have someone",
    body: `Good — then this is coverage and QA, not a replacement. We run alongside for 30 days against the SLA. If we miss, you don't continue. If we hit, you keep the hours your person was wasting on overflow.`,
  },
  {
    id: "sla-1",
    kind: "SLA",
    title: "Standard appointment SLA",
    body: `Outcome: 25 qualified appointments / month.
Qualified = ICP match + 15 min on calendar + recorded source.
First response to inbound: 4 business hours.
Revisions: 2 per booked slot if the prospect reschedules.
Reporting: Friday 16:00 SAST dashboard.
Work starts after setup fee + month 1 clear.`,
  },
  {
    id: "onboard-1",
    kind: "Onboarding",
    title: "Week 0 checklist",
    body: `- Contract + setup invoice paid
- Access: CRM, calendar, inbox, brand voice
- SOP signed
- Vendor assigned + backup named
- Slack/email path (vendor never on client thread)
- First deliverable date
- QA scorecard selected`,
  },
  {
    id: "week-1",
    kind: "Report",
    title: "Weekly client report",
    body: `Period:
Done:
Missed / why:
QA sample score:
Next week plan:
Decisions needed from you:
Invoice status:`,
  },
  {
    id: "vendor-agree",
    kind: "Vendor",
    title: "Vendor working terms",
    body: `Rate, hours, tools, NDA, no client contact, 24h response, backup coverage, 7-day notice, test-task score on file.`,
  },
];
