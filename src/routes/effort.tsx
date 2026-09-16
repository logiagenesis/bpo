import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Stat } from "@/components/stat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { EmptyState } from "@/components/empty-state";
import { clientPnl, round1, usd } from "@/lib/money";
import {
  clientEffort,
  clientVendorCost,
  currentMonth,
  todayIso,
  useApex,
} from "@/lib/store";
import { uid } from "@/lib/utils";
import type { TimeEntry } from "@/lib/types";

export const Route = createFileRoute("/effort")({ component: EffortPage });

function EffortPage() {
  const s = useApex();
  const month = currentMonth();
  const live = s.clients.filter((c) => c.status !== "churned" && c.status !== "paused");

  const rows = live.map((c) => {
    const effort = clientEffort(s, c.id, month);
    const vendor = s.vendors.find((v) => v.id === c.vendorId);
    // What the retainer would have cost at the hours it was priced for, next to
    // what it costs at the hours actually worked. The gap is the whole point.
    const atQuote = clientPnl(c, vendorCostAt(vendor, effort.quotedHours), s.fees);
    const atActual = clientPnl(c, clientVendorCost(s, c, month), s.fees);
    return { c, vendor, effort, atQuote, atActual };
  });

  const loggedHours = round1(rows.reduce((a, r) => a + r.effort.loggedHours, 0));
  const quotedHours = round1(rows.reduce((a, r) => a + r.effort.quotedHours, 0));
  const overrunning = rows.filter((r) => r.effort.overrun);
  const unmeasured = rows.filter((r) => r.effort.unmeasured);
  const marginDrag = round1(
    rows.reduce((a, r) => a + (r.atQuote.gp - r.atActual.gp), 0),
  );

  return (
    <div>
      <PageHeader kicker="Run" title="Effort">
        Hours actually worked, against the hours each retainer was priced for. Margin you
        assumed is not margin you earned.
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Hours logged" value={`${loggedHours}`} hint={`of ${quotedHours} quoted · ${month}`} />
        <Stat
          label="Over the quote"
          value={`${overrunning.length}`}
          tone={overrunning.length ? "loss" : "gain"}
          hint={overrunning.length ? overrunning.map((r) => r.c.company).join(", ") : "Every client inside its hours"}
        />
        <Stat
          label="Margin drag"
          value={usd(marginDrag)}
          tone={marginDrag > 0 ? "loss" : "gain"}
          hint="Gross profit lost to hours beyond the quote"
        />
        <Stat
          label="Unmeasured"
          value={`${unmeasured.length}`}
          tone={unmeasured.length ? "warn" : "gain"}
          hint={unmeasured.length ? "Margin here is an assumption" : "All live clients measured"}
        />
      </div>

      <div className="mt-8 overflow-x-auto rounded-xl bg-surface hair">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.12em] text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Client</th>
              <th className="px-4 py-3 font-medium">Quoted</th>
              <th className="px-4 py-3 font-medium">Logged</th>
              <th className="px-4 py-3 font-medium">Burn</th>
              <th className="px-4 py-3 font-medium">Margin at quote</th>
              <th className="px-4 py-3 font-medium">Margin actual</th>
              <th className="px-4 py-3 font-medium">Flag</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ c, effort, atQuote, atActual }) => {
              const burn = Math.round((effort.loggedHours / effort.quotedHours) * 100);
              return (
                <tr key={c.id} className="border-t border-line">
                  <td className="px-4 py-3">{c.company}</td>
                  <td className="px-4 py-3 tabular">{effort.quotedHours}h</td>
                  <td className="px-4 py-3 tabular">{effort.loggedHours}h</td>
                  <td className={`px-4 py-3 tabular ${effort.overrun ? "text-loss" : "text-muted"}`}>
                    {effort.unmeasured ? "—" : `${burn}%`}
                  </td>
                  <td className="px-4 py-3 tabular text-muted">{atQuote.margin.toFixed(0)}%</td>
                  <td
                    className={`px-4 py-3 tabular ${
                      atActual.margin < atQuote.margin - 1 ? "text-loss" : "text-gain"
                    }`}
                  >
                    {effort.unmeasured ? "—" : `${atActual.margin.toFixed(0)}%`}
                  </td>
                  <td className="px-4 py-3">
                    {effort.unmeasured ? <Badge tone="warn">no hours logged</Badge> : null}
                    {effort.overrun ? (
                      <Badge tone="loss">+{effort.overrunHours}h over</Badge>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <LogHours />

      <section className="mt-8">
        <h2 className="mb-3 font-display text-xl">This month</h2>
        {s.timeEntries.filter((t) => t.date.startsWith(month)).length === 0 ? (
          <EmptyState title="No hours logged" body="Log vendor hours above and the margin figures become measurements." />
        ) : (
          <ul className="divide-y divide-line rounded-xl bg-surface hair">
            {s.timeEntries
              .filter((t) => t.date.startsWith(month))
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((t) => {
                const client = s.clients.find((c) => c.id === t.clientId);
                const vendor = s.vendors.find((v) => v.id === t.vendorId);
                return (
                  <li key={t.id} className="flex items-start justify-between gap-3 px-4 py-3">
                    <div>
                      <p className="text-sm text-fg">
                        {client?.company ?? "Unknown client"} · <span className="tabular">{t.hours}h</span>
                      </p>
                      <p className="text-xs text-muted">
                        {t.date} · {vendor?.name ?? "Unknown vendor"} · {t.note}
                      </p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => s.deleteTimeEntry(t.id)}>
                      Remove
                    </Button>
                  </li>
                );
              })}
          </ul>
        )}
      </section>
    </div>
  );
}

function LogHours() {
  const s = useApex();
  const [draft, setDraft] = useState(() => blank(s.clients[0]?.id ?? "", s.clients[0]?.vendorId ?? ""));

  function submit() {
    if (!draft.clientId || draft.hours <= 0) return;
    s.logTime({ ...draft, id: uid("te") });
    s.log("effort", draft.clientId, `${draft.hours}h logged`);
    setDraft(blank(draft.clientId, draft.vendorId));
  }

  return (
    <section className="mt-8 rounded-xl bg-surface p-4 hair">
      <h2 className="mb-3 font-display text-lg">Log hours</h2>
      <div className="grid gap-3 lg:grid-cols-5">
        <Field label="Client">
          <Select
            value={draft.clientId}
            onChange={(e) => {
              const clientId = e.target.value;
              const client = s.clients.find((c) => c.id === clientId);
              setDraft({ ...draft, clientId, vendorId: client?.vendorId ?? draft.vendorId });
            }}
          >
            {s.clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.company}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Vendor">
          <Select value={draft.vendorId} onChange={(e) => setDraft({ ...draft, vendorId: e.target.value })}>
            {s.vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Date">
          <Input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
        </Field>
        <Field label="Hours">
          <Input
            type="number"
            step="0.5"
            min="0"
            value={draft.hours}
            onChange={(e) => setDraft({ ...draft, hours: Number(e.target.value) })}
          />
        </Field>
        <Field label="Note">
          <Input value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })} placeholder="What the hours went on" />
        </Field>
      </div>
      <div className="mt-3">
        <Button size="sm" onClick={submit} disabled={!draft.clientId || draft.hours <= 0}>
          Log hours
        </Button>
      </div>
    </section>
  );
}

function blank(clientId: string, vendorId: string): TimeEntry {
  return { id: "", clientId, vendorId, date: todayIso(), hours: 0, note: "" };
}

function vendorCostAt(
  vendor: { rateUsd: number; rateType: "hourly" | "monthly" } | undefined,
  hours: number,
) {
  if (!vendor) return 0;
  return vendor.rateType === "monthly" ? vendor.rateUsd : vendor.rateUsd * hours;
}
