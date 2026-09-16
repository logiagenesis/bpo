import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Field, Select, Textarea, Input } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { Stat } from "@/components/stat";
import { usd } from "@/lib/money";
import { todayIso, useApex, vendorMonthly } from "@/lib/store";
import { clientPnl } from "@/lib/money";
import { uid } from "@/lib/utils";

export const Route = createFileRoute("/portal")({ component: PortalPage });

function PortalPage() {
  const s = useApex();
  const client = s.clients.find((c) => c.id === s.portalClientId) ?? s.clients[0];
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  if (!client) return <p className="text-muted">No clients yet.</p>;
  const vendor = s.vendors.find((v) => v.id === client.vendorId);
  const pnl = clientPnl(client, vendorMonthly(vendor), s.fees);
  const reports = s.reports.filter((r) => r.clientId === client.id);
  const reqs = s.requests.filter((r) => r.clientId === client.id);
  const tasks = s.tasks.filter((t) => t.clientId === client.id);
  const qa = s.qa.filter((q) => q.clientId === client.id);

  return (
    <div>
      <PageHeader
        kicker="Client portal"
        title={client.company}
        action={
          <Field label="View as">
            <Select value={client.id} onChange={(e) => s.setPortalClient(e.target.value)}>
              {s.clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company}
                </option>
              ))}
            </Select>
          </Field>
        }
      >
        What the client sees. They do not see vendor names, rates, or your margin.
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Retainer" value={usd(client.monthlyFeeUsd)} />
        <Stat label="SLA" value={client.sla.replace("_", " ")} />
        <Stat label="CSAT" value={client.csat ? client.csat.toFixed(1) : "—"} />
        <Stat label="Status" value={client.status.replace("_", " ")} />
      </div>

      <section className="mt-8">
        <h2 className="font-display text-xl">This week</h2>
        <ul className="mt-3 divide-y divide-line rounded-xl bg-surface hair">
          {tasks.map((t) => (
            <li key={t.id} className="flex justify-between px-4 py-3 text-sm">
              <span>{t.title}</span>
              <Badge>{t.status.replace("_", " ")}</Badge>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-xl">Reports</h2>
        {reports.map((r) => (
          <article key={r.id} className="mt-3 rounded-xl bg-surface p-5 hair">
            <p className="text-xs text-muted">{r.period}</p>
            <p className="mt-2 text-sm">{r.summary}</p>
            <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {r.kpis.map((k) => (
                <div key={k.label}>
                  <dt className="text-xs uppercase tracking-[0.14em] text-muted">{k.label}</dt>
                  <dd className="mt-1 font-display text-2xl tabular">{k.value}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </section>

      <section className="mt-8">
        <h2 className="font-display text-xl">Quality</h2>
        <p className="mt-1 text-sm text-muted">Sample scores. We show the number because hiding it is how clients leave.</p>
        <ul className="mt-3 flex flex-wrap gap-3">
          {qa.map((q) => (
            <li key={q.id} className="rounded-xl bg-surface px-4 py-3 hair">
              <p className="text-xs text-muted">{q.kind}</p>
              <p className="font-display text-2xl tabular">{q.score}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 rounded-xl bg-surface p-5 hair">
        <h2 className="font-display text-xl">Request a change</h2>
        <form
          className="mt-3 grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim()) return;
            s.addRequest({
              id: uid("req"),
              clientId: client.id,
              at: todayIso(),
              title,
              body,
              status: "open",
            });
            setTitle("");
            setBody("");
          }}
        >
          <Field label="Title">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Detail">
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} />
          </Field>
          <Button type="submit">Submit request</Button>
        </form>
        <ul className="mt-4 space-y-2 text-sm">
          {reqs.map((r) => (
            <li key={r.id} className="flex justify-between gap-3 border-t border-line pt-2">
              <span>
                {r.title}
                <span className="block text-xs text-muted">{r.body}</span>
              </span>
              <Badge tone={r.status === "open" ? "warn" : "gain"}>{r.status}</Badge>
            </li>
          ))}
        </ul>
      </section>
      <p className="mt-6 text-xs text-faint">Operator note (hidden from a real portal): margin {pnl.margin.toFixed(0)}% · vendor {vendor?.name}.</p>
    </div>
  );
}
