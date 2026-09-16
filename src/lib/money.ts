import type { Client, SlaLevel } from "./types";
import { SLA_MULTIPLIER } from "./types";

/**
 * Seed rate only. The live rate lives on the store as `fxZar` with the date the
 * operator last set it — a constant compiled into the bundle is wrong the day
 * after it is written, and every rand figure on the desk derives from it.
 */
export const FX_ZAR_SEED = 18.2;

/**
 * Fallback only, for a client priced before anyone recorded the hours it
 * assumes. Previously this number was buried inside vendorMonthly() as a bare
 * `* 80`, which made every hourly vendor cost exactly the same every month
 * regardless of what they worked.
 */
export const HOURS_PER_MONTH_FALLBACK = 80;

/**
 * Sourcing a vendor through a marketplace costs more than the vendor's rate.
 * Percentages are the buyer-side fee charged on payments to the vendor, as
 * published September 2026 — confirm before relying on them commercially.
 * See docs/competitor-audit.md.
 */
export const SOURCING_CHANNELS = [
  { id: "direct", label: "Direct / EFT", vendorFeePct: 0 },
  { id: "upwork", label: "Upwork (Basic)", vendorFeePct: 5 },
  { id: "upwork_business", label: "Upwork (Business Plus)", vendorFeePct: 10 },
  { id: "fiverr", label: "Fiverr", vendorFeePct: 5.5 },
  { id: "other", label: "Other marketplace", vendorFeePct: 10 },
] as const;

export type SourcingChannel = (typeof SOURCING_CHANNELS)[number]["id"];

export interface FeeProfile {
  /**
   * Which channel the vendor is sourced through. Stored alongside the rate
   * because two channels can charge the same percentage — the rate alone
   * cannot tell you which one the operator picked.
   */
  channel: SourcingChannel;
  /** Marketplace fee we pay on top of the vendor's rate, percent. */
  vendorFeePct: number;
  /** Processing fee taken out of what the client pays us, percent. */
  paymentFeePct: number;
}

export const NO_FEES: FeeProfile = { channel: "direct", vendorFeePct: 0, paymentFeePct: 0 };

export function channelFee(id: SourcingChannel) {
  return SOURCING_CHANNELS.find((c) => c.id === id)?.vendorFeePct ?? 0;
}

function clampPct(n: number, max = 100) {
  if (!Number.isFinite(n)) return 0;
  return Math.min(max, Math.max(0, n));
}

/** What the vendor actually costs once the marketplace has taken its cut. */
export function landedVendorCost(vendorCost: number, vendorFeePct = 0) {
  return round2(vendorCost * (1 + clampPct(vendorFeePct, 50) / 100));
}

/**
 * Price up from what delivery really costs, so the target margin survives
 * contact with the fees. Vendor-side fees raise the cost base; payment-side
 * fees come out of revenue, so the price is grossed up to absorb them.
 */
export function priceFromCost(
  vendorCost: number,
  marginPct: number,
  sla: SlaLevel = "standard",
  fees: FeeProfile = NO_FEES,
) {
  const m = Math.min(85, Math.max(5, marginPct)) / 100;
  const base = landedVendorCost(vendorCost, fees.vendorFeePct) / (1 - m);
  const withSla = base * SLA_MULTIPLIER[sla];
  const payment = clampPct(fees.paymentFeePct, 50) / 100;
  return round2(withSla / (1 - payment));
}

export function grossProfit(revenue: number, vendor: number, tools = 0, other = 0) {
  return round2(revenue - vendor - tools - other);
}

export function marginPct(revenue: number, gp: number) {
  if (revenue <= 0) return 0;
  return round1((gp / revenue) * 100);
}

export function round2(n: number) {
  return Math.round(n * 100) / 100;
}
export function round1(n: number) {
  return Math.round(n * 10) / 10;
}

export function usd(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function usdExact(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n);
}

/**
 * Formatted by hand, not by Intl. Node's ICU groups "en-ZA" with a non-breaking
 * space while Chrome groups it with a comma, so an Intl-formatted rand amount
 * renders differently on the server and in the browser and breaks hydration.
 * SA convention is a space separator, so we emit that on both sides.
 */
export function zar(nUsd: number, fx = FX_ZAR_SEED) {
  const rands = Math.round(nUsd * fx);
  const sign = rands < 0 ? "-" : "";
  const grouped = Math.abs(rands)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
  return `${sign}R\u00a0${grouped}`;
}

export function marginTone(pct: number): "gain" | "warn" | "loss" {
  if (pct >= 45) return "gain";
  if (pct >= 30) return "warn";
  return "loss";
}

export function clientPnl(c: Client, vendorRateMonthly: number, fees: FeeProfile = NO_FEES) {
  const vendor = landedVendorCost(vendorRateMonthly, fees.vendorFeePct);
  const paymentFee = round2(c.monthlyFeeUsd * (clampPct(fees.paymentFeePct, 50) / 100));
  const gp = grossProfit(c.monthlyFeeUsd, vendor, c.toolCostUsd, c.otherCostUsd + paymentFee);
  const m = marginPct(c.monthlyFeeUsd, gp);
  return { vendor, paymentFee, gp, margin: m, tone: marginTone(m) };
}

export function scoreLead(input: {
  hiringSignal: boolean;
  outsourcingIntent: boolean;
  employees: string;
  website: string;
  email: string;
  linkedin: string;
  painPoints: string[];
  industryMatch: boolean;
}) {
  let s = 20;
  if (input.hiringSignal) s += 22;
  if (input.outsourcingIntent) s += 20;
  const emp = input.employees;
  if (emp === "11-50" || emp === "51-200") s += 14;
  else if (emp === "1-10") s += 6;
  else if (emp === "201-1000") s += 8;
  if (input.website) s += 6;
  if (input.email) s += 8;
  if (input.linkedin) s += 5;
  if (input.industryMatch) s += 10;
  if (input.painPoints.length >= 2) s += 8;
  return Math.min(99, s);
}

export interface EffortSummary {
  quotedHours: number;
  loggedHours: number;
  /** Positive means more hours went in than the price assumed. */
  overrunHours: number;
  overrunPct: number;
  /** Past the hours the price assumed. No tolerance band — over is over. */
  overrun: boolean;
  /** Nothing logged yet — the figures are an assumption, not a measurement. */
  unmeasured: boolean;
}

export function effortSummary(quotedHours: number, loggedHours: number): EffortSummary {
  const quoted = quotedHours > 0 ? quotedHours : HOURS_PER_MONTH_FALLBACK;
  const overrunHours = round1(loggedHours - quoted);
  return {
    quotedHours: quoted,
    loggedHours: round1(loggedHours),
    overrunHours,
    overrunPct: round1((overrunHours / quoted) * 100),
    overrun: loggedHours > quoted,
    unmeasured: loggedHours <= 0,
  };
}

/**
 * What the vendor costs for a month. An hourly vendor is billed on hours
 * actually worked; a monthly vendor costs the retainer whatever the hours,
 * which is exactly why overrun on a monthly vendor is a quality and renewal
 * risk rather than an immediate cost.
 */
export function vendorCostForMonth(
  vendor: { rateUsd: number; rateType: "hourly" | "monthly" } | undefined,
  hours: number,
) {
  if (!vendor) return 0;
  if (vendor.rateType === "monthly") return vendor.rateUsd;
  return round2(vendor.rateUsd * Math.max(0, hours));
}

export interface CashSummary {
  invoiced: number;
  collected: number;
  outstanding: number;
  overdue: number;
  /** Days sales outstanding: how long cash takes to arrive, on average. */
  dso: number;
  /** Outstanding split by how late it is. */
  ageing: { current: number; d1to30: number; d31to60: number; d60plus: number };
}

export function invoiceState(
  invoice: { paidAt: string | null; dueAt: string },
  today: string,
): "paid" | "due" | "overdue" {
  if (invoice.paidAt) return "paid";
  return invoice.dueAt < today ? "overdue" : "due";
}

export function daysBetween(from: string, to: string) {
  const a = Date.parse(`${from}T00:00:00Z`);
  const b = Date.parse(`${to}T00:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.round((b - a) / 86_400_000);
}

/**
 * Cash, not revenue. DSO counts paid invoices by how long they took, and
 * unpaid ones by how long they have been waiting — leaving the stale ones out
 * would make the number look better the worse things got.
 */
export function cashSummary(
  invoices: { amountUsd: number; issuedAt: string; dueAt: string; paidAt: string | null }[],
  today: string,
): CashSummary {
  const invoiced = round2(invoices.reduce((a, i) => a + i.amountUsd, 0));
  const collected = round2(
    invoices.filter((i) => i.paidAt).reduce((a, i) => a + i.amountUsd, 0),
  );
  const open = invoices.filter((i) => !i.paidAt);
  const outstanding = round2(open.reduce((a, i) => a + i.amountUsd, 0));
  const overdue = round2(
    open.filter((i) => i.dueAt < today).reduce((a, i) => a + i.amountUsd, 0),
  );

  const spans = invoices.map((i) => daysBetween(i.issuedAt, i.paidAt ?? today));
  const dso = spans.length ? round1(spans.reduce((a, d) => a + d, 0) / spans.length) : 0;

  const ageing = { current: 0, d1to30: 0, d31to60: 0, d60plus: 0 };
  for (const i of open) {
    const late = daysBetween(i.dueAt, today);
    if (late <= 0) ageing.current += i.amountUsd;
    else if (late <= 30) ageing.d1to30 += i.amountUsd;
    else if (late <= 60) ageing.d31to60 += i.amountUsd;
    else ageing.d60plus += i.amountUsd;
  }

  return {
    invoiced,
    collected,
    outstanding,
    overdue,
    dso,
    ageing: {
      current: round2(ageing.current),
      d1to30: round2(ageing.d1to30),
      d31to60: round2(ageing.d31to60),
      d60plus: round2(ageing.d60plus),
    },
  };
}
