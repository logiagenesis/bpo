import type { Client, SlaLevel } from "./types";
import { SLA_MULTIPLIER } from "./types";

export const FX_ZAR = 18.2;

export function priceFromCost(vendorCost: number, marginPct: number, sla: SlaLevel = "standard") {
  const m = Math.min(85, Math.max(5, marginPct)) / 100;
  const base = vendorCost / (1 - m);
  return round2(base * SLA_MULTIPLIER[sla]);
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

export function zar(nUsd: number, fx = FX_ZAR) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(nUsd * fx);
}

export function marginTone(pct: number): "gain" | "warn" | "loss" {
  if (pct >= 45) return "gain";
  if (pct >= 30) return "warn";
  return "loss";
}

export function clientPnl(c: Client, vendorRateMonthly: number) {
  const vendor = vendorRateMonthly;
  const gp = grossProfit(c.monthlyFeeUsd, vendor, c.toolCostUsd, c.otherCostUsd);
  const m = marginPct(c.monthlyFeeUsd, gp);
  return { vendor, gp, margin: m, tone: marginTone(m) };
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
