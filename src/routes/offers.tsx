import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { runOfferCopy } from "@/lib/ai.functions";
import { landedVendorCost, marginPct, marginTone, priceFromCost, usd } from "@/lib/money";
import type { FeeProfile } from "@/lib/money";
import { todayIso, useApex } from "@/lib/store";
import { SERVICE_LABEL, SERVICES, SLA_LEVELS, type Offer, type ServiceType, type SlaLevel } from "@/lib/types";
import { uid } from "@/lib/utils";
import { asStr, extractJson } from "@/lib/json";

export const Route = createFileRoute("/offers")({ component: OffersPage });

function OffersPage() {
  const s = useApex();
  const [id, setId] = useState(s.offers[0]?.id ?? "");
  const existing = s.offers.find((o) => o.id === id);
  const [draft, setDraft] = useState<Offer>(existing ?? blankOffer(s.fees));
  // Margin on what delivery actually costs: the vendor's rate plus the
  // marketplace fee on it, less the processing fee taken out of the client's
  // payment. Quoting against the raw rate overstates every margin on this page.
  const landed = landedVendorCost(draft.vendorCostUsd, s.fees.vendorFeePct);
  const paymentFee = draft.priceUsd * (s.fees.paymentFeePct / 100);
  const gp = draft.priceUsd - landed - paymentFee;
  const m = marginPct(draft.priceUsd, gp);
  const tone = marginTone(m);
  const [busy, setBusy] = useState(false);

  useMemo(() => {
    if (existing && existing.id !== draft.id) setDraft(existing);
    return existing;
  }, [existing, draft.id]);

  function recalc(next: Partial<Offer>) {
    const merged = { ...draft, ...next };
    if (next.vendorCostUsd != null || next.desiredMarginPct != null || next.sla != null) {
      merged.priceUsd = Math.round(priceFromCost(merged.vendorCostUsd, merged.desiredMarginPct, merged.sla, s.fees));
    }
    setDraft(merged);
  }

  async function polish() {
    setBusy(true);
    const res = await runOfferCopy({
      data: {
        spec: JSON.stringify({
          service: draft.service,
          industry: draft.industry,
          vendorCostUsd: draft.vendorCostUsd,
          priceUsd: draft.priceUsd,
          sla: draft.sla,
          workload: draft.workload,
        }),
      },
    });
    setBusy(false);
    if (res.ok) {
      const j = extractJson(res.text) ?? {};
      setDraft({
        ...draft,
        name: asStr(j.name) || draft.name,
        deliverables: asStr(j.deliverables) || draft.deliverables,
        copy: asStr(j.copy) || draft.copy,
        upsells: asStr(j.upsells) || draft.upsells,
        riskWarnings: asStr(j.riskWarnings) || draft.riskWarnings,
      });
    }
  }

  return (
    <div>
      <PageHeader
        kicker="Money"
        title="Offer builder"
        action={
          <>
            <Button variant="outline" onClick={() => { const o = blankOffer(s.fees); setDraft(o); setId(o.id); }}>
              New
            </Button>
            <Button
              onClick={() => {
                s.upsertOffer(draft);
                setId(draft.id);
                s.log("offer", draft.id, `Saved ${draft.name} at ${usd(draft.priceUsd)} / ${m.toFixed(0)}%`);
              }}
            >
              Save offer
            </Button>
          </>
        }
      >
        Cost the vendor first. Price falls out of the margin you want. Below 40% the desk warns you.
      </PageHeader>

      <div className="mb-4 flex flex-wrap gap-2">
        {s.offers.map((o) => (
          <button
            key={o.id}
            type="button"
            className={`h-11 rounded-md px-3 text-sm ${o.id === draft.id ? "bg-accent text-accent-fg" : "bg-surface hair"}`}
            onClick={() => {
              setId(o.id);
              setDraft(o);
            }}
          >
            {o.name}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="grid gap-3 rounded-xl bg-surface p-5 hair sm:grid-cols-2">
          <Field label="Package name" className="sm:col-span-2">
            <Input value={draft.name} onChange={(e) => recalc({ name: e.target.value })} />
          </Field>
          <Field label="Service">
            <Select value={draft.service} onChange={(e) => recalc({ service: e.target.value as ServiceType })}>
              {SERVICES.map((x) => (
                <option key={x} value={x}>
                  {SERVICE_LABEL[x]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Industry">
            <Input value={draft.industry} onChange={(e) => recalc({ industry: e.target.value })} />
          </Field>
          <Field label="Vendor cost / mo (USD)">
            <Input type="number" value={draft.vendorCostUsd} onChange={(e) => recalc({ vendorCostUsd: Number(e.target.value) })} />
          </Field>
          <Field label="Desired margin %">
            <Input type="number" value={draft.desiredMarginPct} onChange={(e) => recalc({ desiredMarginPct: Number(e.target.value) })} />
          </Field>
          <Field label="SLA">
            <Select value={draft.sla} onChange={(e) => recalc({ sla: e.target.value as SlaLevel })}>
              {SLA_LEVELS.map((x) => (
                <option key={x} value={x}>
                  {x.replace("_", " ")}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Timeline">
            <Input value={draft.timeline} onChange={(e) => recalc({ timeline: e.target.value })} />
          </Field>
          <Field label="Workload" className="sm:col-span-2">
            <Input value={draft.workload} onChange={(e) => recalc({ workload: e.target.value })} />
          </Field>
          <Field label="Deliverables" className="sm:col-span-2">
            <Textarea value={draft.deliverables} onChange={(e) => recalc({ deliverables: e.target.value })} />
          </Field>
          <Field label="Upsells" className="sm:col-span-2">
            <Input value={draft.upsells} onChange={(e) => recalc({ upsells: e.target.value })} />
          </Field>
          <Field label="Risks" className="sm:col-span-2">
            <Textarea value={draft.riskWarnings} onChange={(e) => recalc({ riskWarnings: e.target.value })} />
          </Field>
          <Field label="One-line" className="sm:col-span-2">
            <Input value={draft.copy} onChange={(e) => recalc({ copy: e.target.value })} />
          </Field>
          <Button type="button" variant="outline" onClick={() => void polish()} disabled={busy}>
            {busy ? "Writing…" : "Polish with AI"}
          </Button>
        </div>

        <aside className="h-fit rounded-xl bg-surface p-5 hair">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Quote</p>
          <p className="mt-2 font-display text-4xl tabular">{usd(draft.priceUsd)}</p>
          <p className="text-sm text-muted">per month</p>
          <dl className="mt-4 space-y-2 text-sm">
            <Row k="Vendor" v={usd(draft.vendorCostUsd)} />
            {landed !== draft.vendorCostUsd ? <Row k="+ marketplace fee" v={usd(landed - draft.vendorCostUsd)} /> : null}
            {paymentFee > 0 ? <Row k="− payment fee" v={usd(paymentFee)} /> : null}
            <Row k="Gross profit" v={usd(gp)} />
            <Row k="Margin" v={`${m.toFixed(0)}%`} warn={tone !== "gain"} />
          </dl>
          {m < 40 ? (
            <p className="mt-4 text-sm text-loss">Below 40%. Do not send this number. Raise price or cut cost.</p>
          ) : (
            <p className="mt-4 text-sm text-gain">Inside the 45–60% band, or close enough to defend.</p>
          )}
          <Badge tone={tone === "gain" ? "gain" : tone === "warn" ? "warn" : "loss"} className="mt-3">
            {draft.sla.replace("_", " ")} SLA
          </Badge>
        </aside>
      </div>
    </div>
  );
}

function Row({ k, v, warn }: { k: string; v: string; warn?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted">{k}</dt>
      <dd className={`tabular ${warn ? "text-loss" : "text-fg"}`}>{v}</dd>
    </div>
  );
}

function blankOffer(fees: FeeProfile): Offer {
  const vendor = 1500;
  const margin = 50;
  return {
    id: uid("off"),
    name: "New package",
    service: "appointment_setting",
    industry: "",
    deliverables: "",
    workload: "",
    vendorCostUsd: vendor,
    quotedHoursPerMonth: 160,
    desiredMarginPct: margin,
    sla: "standard",
    timeline: "Live in 10 working days",
    priceUsd: Math.round(priceFromCost(vendor, margin, "standard", fees)),
    upsells: "",
    riskWarnings: "",
    copy: "",
    createdAt: todayIso(),
  };
}
