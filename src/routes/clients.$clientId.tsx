import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { Stat } from "@/components/stat";
import { clientPnl, usd } from "@/lib/money";
import { clientEffort, clientVendorCost, useApex } from "@/lib/store";
import type { Client } from "@/lib/types";

export const Route = createFileRoute("/clients/$clientId")({ component: ClientDetail });

function ClientDetail() {
  const { clientId } = Route.useParams();
  const s = useApex();
  const found = s.clients.find((c) => c.id === clientId);
  const [c, setC] = useState(found);
  if (!found || !c) {
    return (
      <p className="text-muted">
        Missing. <Link to="/clients">Back</Link>
      </p>
    );
  }
  const vendor = s.vendors.find((v) => v.id === c.vendorId);
  const offer = s.offers.find((o) => o.id === c.offerId);
  const pnl = clientPnl(c, clientVendorCost(s, c), s.fees);
  const effort = clientEffort(s, c.id);
  const tasks = s.tasks.filter((t) => t.clientId === c.id);
  const qa = s.qa.filter((q) => q.clientId === c.id);
  const reports = s.reports.filter((r) => r.clientId === c.id);
  const reqs = s.requests.filter((r) => r.clientId === c.id);
  const set = (k: keyof Client, v: unknown) => setC({ ...c, [k]: v } as Client);

  return (
    <div>
      <PageHeader
        kicker="Client"
        title={c.company}
        action={
          <>
            <Button variant="outline" onClick={() => s.setPortalClient(c.id)}>
              Open portal as them
            </Button>
            <Button
              onClick={() => {
                s.upsertClient(c);
                if (vendor) {
                  s.upsertVendor({
                    ...vendor,
                    assignedClientIds: Array.from(new Set([...vendor.assignedClientIds, c.id])),
                  });
                }
              }}
            >
              Save
            </Button>
          </>
        }
      >
        {c.contactName} · {c.country} · started {c.startDate}
      </PageHeader>

      {c.invoiceStatus !== "current" ? (
        <p className="mb-4 rounded-md bg-loss/10 px-4 py-3 text-sm text-loss">
          {c.invoiceStatus === "overdue"
            ? "Invoice overdue. Do not expand scope. Chase, then pause new work."
            : "Setup unpaid. Vendor work does not start."}
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Fee" value={usd(c.monthlyFeeUsd)} />
        <Stat label="Vendor" value={usd(pnl.vendor)} />
        <Stat label="Gross profit" value={usd(pnl.gp)} tone="gain" />
        <Stat label="Margin" value={`${pnl.margin.toFixed(0)}%`} tone={pnl.tone} />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Field label="Status">
          <Select value={c.status} onChange={(e) => set("status", e.target.value)}>
            {["onboarding", "active", "at_risk", "paused", "churned"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </Select>
        </Field>
        <Field label="Invoice">
          <Select value={c.invoiceStatus} onChange={(e) => set("invoiceStatus", e.target.value)}>
            <option value="current">current</option>
            <option value="overdue">overdue</option>
            <option value="unpaid_setup">unpaid setup</option>
          </Select>
        </Field>
        <Field label="Monthly fee USD">
          <Input type="number" value={c.monthlyFeeUsd} onChange={(e) => set("monthlyFeeUsd", Number(e.target.value))} />
        </Field>
        <Field label="Tool cost">
          <Input type="number" value={c.toolCostUsd} onChange={(e) => set("toolCostUsd", Number(e.target.value))} />
        </Field>
        <Field label="Vendor">
          <Select value={c.vendorId} onChange={(e) => set("vendorId", e.target.value)}>
            {s.vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} — {usd(v.rateUsd)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Offer">
          <Select value={c.offerId} onChange={(e) => set("offerId", e.target.value)}>
            {s.offers.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="CSAT">
          <Input type="number" step="0.1" value={c.csat} onChange={(e) => set("csat", Number(e.target.value))} />
        </Field>
        <Field label="SLA">
          <Select value={c.sla} onChange={(e) => set("sla", e.target.value)}>
            <option value="standard">standard</option>
            <option value="priority">priority</option>
            <option value="white_glove">white glove</option>
          </Select>
        </Field>
        <Field label="Notes" className="sm:col-span-2">
          <Textarea value={c.notes} onChange={(e) => set("notes", e.target.value)} />
        </Field>
      </div>

      <section className="mt-8">
        <h2 className="font-display text-xl">Tasks</h2>
        <ul className="mt-2 divide-y divide-line rounded-xl bg-surface hair">
          {tasks.map((t) => (
            <li key={t.id} className="flex justify-between px-4 py-3 text-sm">
              <span>{t.title}</span>
              <Badge>{t.status.replace("_", " ")}</Badge>
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-8">
        <h2 className="font-display text-xl">QA</h2>
        <ul className="mt-2 space-y-2">
          {qa.map((q) => (
            <li key={q.id} className="rounded-xl bg-surface p-4 text-sm hair">
              <div className="flex justify-between">
                <span>{q.kind}</span>
                <span className={q.score < 80 ? "text-loss" : "text-gain"}>{q.score}</span>
              </div>
              <p className="mt-1 text-muted">{q.mistakes}</p>
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-8">
        <h2 className="font-display text-xl">Reports</h2>
        {reports.map((r) => (
          <article key={r.id} className="mt-2 rounded-xl bg-surface p-4 hair">
            <p className="text-xs text-muted">{r.period}</p>
            <p className="mt-1 text-sm">{r.summary}</p>
          </article>
        ))}
      </section>
      <section className="mt-8">
        <h2 className="font-display text-xl">Requests</h2>
        <ul className="mt-2 space-y-2 text-sm">
          {reqs.map((r) => (
            <li key={r.id} className="rounded-xl bg-surface p-4 hair">
              <div className="flex justify-between">
                <span>{r.title}</span>
                <Badge tone={r.status === "open" ? "warn" : "gain"}>{r.status}</Badge>
              </div>
              <p className="mt-1 text-muted">{r.body}</p>
            </li>
          ))}
        </ul>
      </section>
      {offer ? <p className="mt-6 text-sm text-muted">Package: {offer.name} — {offer.copy}</p> : null}
    </div>
  );
}
