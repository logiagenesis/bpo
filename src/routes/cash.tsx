import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Stat } from "@/components/stat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { EmptyState } from "@/components/empty-state";
import { daysBetween, invoiceState, usd, zar } from "@/lib/money";
import { cash, todayIso, useApex } from "@/lib/store";
import { uid } from "@/lib/utils";
import type { Invoice } from "@/lib/types";

export const Route = createFileRoute("/cash")({ component: CashPage });

function CashPage() {
  const s = useApex();
  const today = todayIso();
  const summary = cash(s);

  const rows = [...s.invoices]
    .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt))
    .map((i) => ({
      i,
      client: s.clients.find((c) => c.id === i.clientId),
      state: invoiceState(i, today),
      lateDays: i.paidAt ? 0 : Math.max(0, daysBetween(i.dueAt, today)),
    }));

  const open = rows.filter((r) => r.state !== "paid");

  return (
    <div>
      <PageHeader kicker="Money" title="Cash">
        Gross profit is an opinion until the money lands. Invoiced is not collected.
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Collected" value={usd(summary.collected)} tone="gain" hint={zar(summary.collected, s.fxZar)} />
        <Stat
          label="Outstanding"
          value={usd(summary.outstanding)}
          tone={summary.outstanding > 0 ? "warn" : "gain"}
          hint={`of ${usd(summary.invoiced)} invoiced`}
        />
        <Stat
          label="Overdue"
          value={usd(summary.overdue)}
          tone={summary.overdue > 0 ? "loss" : "gain"}
          hint={summary.overdue > 0 ? `${open.filter((r) => r.state === "overdue").length} invoices past due` : "Nothing past due"}
        />
        <Stat
          label="DSO"
          value={`${summary.dso} days`}
          tone={summary.dso > 30 ? "loss" : summary.dso > 21 ? "warn" : "gain"}
          hint="Issue to payment, unpaid counted to today"
        />
      </div>

      <section className="mt-8 rounded-xl bg-surface p-4 hair">
        <h2 className="mb-3 font-display text-lg">Ageing</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Age label="Not yet due" value={summary.ageing.current} tone="muted" />
          <Age label="1–30 days late" value={summary.ageing.d1to30} tone="warn" />
          <Age label="31–60 days late" value={summary.ageing.d31to60} tone="loss" />
          <Age label="60+ days late" value={summary.ageing.d60plus} tone="loss" />
        </div>
      </section>

      <RaiseInvoice />

      <section className="mt-8">
        <h2 className="mb-3 font-display text-xl">Invoices</h2>
        {rows.length === 0 ? (
          <EmptyState title="Nothing invoiced" body="Raise an invoice above and the cash figures become real." />
        ) : (
          <div className="overflow-x-auto rounded-xl bg-surface hair">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.12em] text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Invoice</th>
                  <th className="px-4 py-3 font-medium">Client</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Issued</th>
                  <th className="px-4 py-3 font-medium">Due</th>
                  <th className="px-4 py-3 font-medium">State</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ i, client, state, lateDays }) => (
                  <tr key={i.id} className="border-t border-line">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs">{i.number}</span>
                      <div className="text-xs text-muted">{i.kind}</div>
                    </td>
                    <td className="px-4 py-3">
                      {client?.company ?? "—"}
                      <div className="text-xs text-muted">{i.note}</div>
                    </td>
                    <td className="px-4 py-3 tabular">{usd(i.amountUsd)}</td>
                    <td className="px-4 py-3 tabular text-muted">{i.issuedAt}</td>
                    <td className="px-4 py-3 tabular text-muted">{i.dueAt}</td>
                    <td className="px-4 py-3">
                      {state === "paid" ? (
                        <Badge tone="gain">paid {i.paidAt}</Badge>
                      ) : state === "overdue" ? (
                        <Badge tone="loss">{lateDays}d late</Badge>
                      ) : (
                        <Badge tone="muted">due</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {state === "paid" ? null : (
                        <Button size="sm" variant="quiet" onClick={() => s.markInvoicePaid(i.id, todayIso())}>
                          Mark paid
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Age({ label, value, tone }: { label: string; value: number; tone: "muted" | "warn" | "loss" }) {
  const colour = value === 0 ? "text-faint" : tone === "loss" ? "text-loss" : tone === "warn" ? "text-warn" : "text-fg";
  return (
    <div className="rounded-lg bg-raised px-3 py-3">
      <p className="text-xs text-muted">{label}</p>
      <p className={`mt-1 tabular text-lg ${colour}`}>{usd(value)}</p>
    </div>
  );
}

function RaiseInvoice() {
  const s = useApex();
  const [draft, setDraft] = useState<Invoice>(() => blank(s.clients[0]));

  function submit() {
    if (!draft.clientId || draft.amountUsd <= 0) return;
    s.upsertInvoice({ ...draft, id: uid("inv") });
    s.log("invoice", draft.clientId, `${draft.number} raised for ${usd(draft.amountUsd)}`);
    setDraft(blank(s.clients.find((c) => c.id === draft.clientId)));
  }

  return (
    <section className="mt-8 rounded-xl bg-surface p-4 hair">
      <h2 className="mb-3 font-display text-lg">Raise an invoice</h2>
      <div className="grid gap-3 lg:grid-cols-6">
        <Field label="Client">
          <Select
            value={draft.clientId}
            onChange={(e) => {
              const client = s.clients.find((c) => c.id === e.target.value);
              setDraft({ ...draft, clientId: e.target.value, amountUsd: client?.monthlyFeeUsd ?? draft.amountUsd });
            }}
          >
            {s.clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.company}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Number">
          <Input value={draft.number} onChange={(e) => setDraft({ ...draft, number: e.target.value })} />
        </Field>
        <Field label="Kind">
          <Select value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.target.value as Invoice["kind"] })}>
            <option value="retainer">retainer</option>
            <option value="setup">setup</option>
          </Select>
        </Field>
        <Field label="Amount (USD)">
          <Input
            type="number"
            min="0"
            value={draft.amountUsd}
            onChange={(e) => setDraft({ ...draft, amountUsd: Number(e.target.value) })}
          />
        </Field>
        <Field label="Issued">
          <Input type="date" value={draft.issuedAt} onChange={(e) => setDraft({ ...draft, issuedAt: e.target.value })} />
        </Field>
        <Field label="Due">
          <Input type="date" value={draft.dueAt} onChange={(e) => setDraft({ ...draft, dueAt: e.target.value })} />
        </Field>
      </div>
      <div className="mt-3">
        <Button size="sm" onClick={submit} disabled={!draft.clientId || draft.amountUsd <= 0}>
          Raise invoice
        </Button>
      </div>
    </section>
  );
}

function blank(client: { id: string; monthlyFeeUsd: number } | undefined): Invoice {
  const issued = todayIso();
  return {
    id: "",
    clientId: client?.id ?? "",
    number: `APX-${Math.floor(1000 + Math.random() * 9000)}`,
    kind: "retainer",
    amountUsd: client?.monthlyFeeUsd ?? 0,
    issuedAt: issued,
    dueAt: plusDays(issued, 14),
    paidAt: null,
    note: "",
  };
}

function plusDays(iso: string, days: number) {
  const t = Date.parse(`${iso}T00:00:00Z`);
  if (Number.isNaN(t)) return iso;
  return new Date(t + days * 86_400_000).toISOString().slice(0, 10);
}
