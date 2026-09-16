import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Stat } from "@/components/stat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { kpis, useApex, vendorMonthly } from "@/lib/store";
import { clientPnl, usd, zar } from "@/lib/money";
import { STAGE_LABEL } from "@/lib/types";

export const Route = createFileRoute("/")({ component: Command });

function Command() {
  const s = useApex();
  const { mrr, gp, margin, pipeline, dueToday, hot, atRisk, thin, openDeals, vendor } = kpis(s);
  const next = nextMove(s, dueToday, hot, atRisk);

  return (
    <div>
      <PageHeader kicker="Command" title="What makes money today" action={<Link to="/assistant"><Button>Ask the desk</Button></Link>}>
        Demo workspace. Numbers are live against the seeded operation — edit anything, it stays in this browser.
      </PageHeader>

      <p className="mb-6 rounded-lg bg-raised px-4 py-3 text-sm text-fg hair">
        Next move: <span className="font-medium">{next}</span>
      </p>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="MRR" value={usd(mrr)} hint={`${zar(mrr, s.fxZar)} · ${s.clients.filter((c) => c.status !== "churned").length} clients`} />
        <Stat label="Gross profit" value={usd(gp)} hint={`Vendor ${usd(vendor)}`} tone="gain" />
        <Stat label="Gross margin" value={`${margin.toFixed(0)}%`} tone={margin >= 45 ? "gain" : margin >= 30 ? "warn" : "loss"} hint="Target 45–60%" />
        <Stat label="Weighted pipeline" value={usd(pipeline)} hint={`${openDeals.length} open deals`} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 font-display text-xl">Due today</h2>
          <ul className="divide-y divide-line rounded-xl bg-surface hair">
            {dueToday.length === 0 ? (
              <li className="px-4 py-6 text-sm text-muted">Nothing due. Fill the pipeline.</li>
            ) : (
              dueToday.slice(0, 6).map((t) => (
                <li key={t.id} className="flex items-start justify-between gap-3 px-4 py-3">
                  <div>
                    <p className="text-sm text-fg">{t.title}</p>
                    <p className="text-xs text-muted">
                      {t.priority} · {t.status.replace("_", " ")}
                    </p>
                  </div>
                  <Badge tone={t.priority === "high" ? "loss" : "muted"}>{t.dueAt}</Badge>
                </li>
              ))
            )}
          </ul>
          <Link to="/tasks" className="mt-2 inline-block text-sm text-muted hover:text-fg">
            Open tasks
          </Link>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl">Hottest leads</h2>
          <ul className="divide-y divide-line rounded-xl bg-surface hair">
            {hot.slice(0, 5).map((l) => (
              <li key={l.id}>
                <Link to="/leads/$leadId" params={{ leadId: l.id }} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-raised/60">
                  <div>
                    <p className="text-sm text-fg">{l.company}</p>
                    <p className="text-xs text-muted">
                      {l.contactName} · {STAGE_LABEL[l.status]}
                    </p>
                  </div>
                  <span className="tabular text-sm text-accent">{l.score}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl">At risk</h2>
          <ul className="divide-y divide-line rounded-xl bg-surface hair">
            {atRisk.length === 0 ? (
              <li className="px-4 py-6 text-sm text-muted">No flags. Keep reporting.</li>
            ) : (
              atRisk.map((c) => (
                <li key={c.id}>
                  <Link to="/clients/$clientId" params={{ clientId: c.id }} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-raised/60">
                    <div>
                      <p className="text-sm text-fg">{c.company}</p>
                      <p className="text-xs text-muted">
                        CSAT {c.csat || "—"} · {c.invoiceStatus.replace("_", " ")}
                      </p>
                    </div>
                    <Badge tone={c.invoiceStatus !== "current" ? "loss" : "warn"}>{c.status.replace("_", " ")}</Badge>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl">Thin margin</h2>
          <ul className="divide-y divide-line rounded-xl bg-surface hair">
            {thin.length === 0 ? (
              <li className="px-4 py-6 text-sm text-muted">Every live client is at or above 40%.</li>
            ) : (
              thin.map(({ c, pnl }) => (
                <li key={c.id} className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm">{c.company}</span>
                  <span className="tabular text-loss">{pnl.margin.toFixed(0)}%</span>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>

      <section className="mt-8">
        <h2 className="mb-3 font-display text-xl">Activity</h2>
        <ul className="space-y-2">
          {s.activities.slice(0, 6).map((a) => (
            <li key={a.id} className="text-sm text-muted">
              <span className="tabular text-faint">{a.at.slice(0, 16).replace("T", " ")}</span> · {a.text}
            </li>
          ))}
        </ul>
      </section>

      <MoneyStrip />
    </div>
  );
}

function MoneyStrip() {
  const s = useApex();
  const rows = s.clients
    .filter((c) => c.status !== "churned")
    .map((c) => {
      const v = s.vendors.find((x) => x.id === c.vendorId);
      return { c, pnl: clientPnl(c, vendorMonthly(v), s.fees) };
    });
  return (
    <section className="mt-10">
      <h2 className="mb-3 font-display text-xl">Client P&L</h2>
      <div className="overflow-x-auto rounded-xl bg-surface hair">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.12em] text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Client</th>
              <th className="px-4 py-3 font-medium">Fee</th>
              <th className="px-4 py-3 font-medium">Vendor</th>
              <th className="px-4 py-3 font-medium">GP</th>
              <th className="px-4 py-3 font-medium">Margin</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ c, pnl }) => (
              <tr key={c.id} className="border-t border-line">
                <td className="px-4 py-3">{c.company}</td>
                <td className="px-4 py-3 tabular">{usd(c.monthlyFeeUsd)}</td>
                <td className="px-4 py-3 tabular">{usd(pnl.vendor)}</td>
                <td className="px-4 py-3 tabular text-gain">{usd(pnl.gp)}</td>
                <td className={`px-4 py-3 tabular ${pnl.tone === "gain" ? "text-gain" : pnl.tone === "warn" ? "text-warn" : "text-loss"}`}>
                  {pnl.margin.toFixed(0)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function nextMove(s: ReturnType<typeof useApex.getState>, due: ReturnType<typeof kpis>["dueToday"], hot: ReturnType<typeof kpis>["hot"], atRisk: ReturnType<typeof kpis>["atRisk"]) {
  const overdue = s.clients.find((c) => c.invoiceStatus === "overdue");
  if (overdue) return `Chase ${overdue.company} — invoice overdue. Do not expand scope.`;
  const setup = s.clients.find((c) => c.invoiceStatus === "unpaid_setup");
  if (setup) return `Collect setup from ${setup.company} before any vendor work.`;
  if (atRisk[0]) return `Protect ${atRisk[0].company} — CSAT or status is off.`;
  if (due[0]) return due[0].title;
  if (hot[0]) return `Work ${hot[0].company} (score ${hot[0].score}). ${hot[0].nextAction}`;
  return "Add a lead or paste a job into Outreach.";
}
