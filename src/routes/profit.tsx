import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Stat } from "@/components/stat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { clientPnl, usd, zar } from "@/lib/money";
import { kpis, useApex, vendorMonthly } from "@/lib/store";

export const Route = createFileRoute("/profit")({ component: ProfitPage });

function ProfitPage() {
  const s = useApex();
  const { mrr, gp, margin, vendor, tools, pipeline } = kpis(s);
  const rows = s.clients.map((c) => {
    const v = s.vendors.find((x) => x.id === c.vendorId);
    return { c, v, pnl: clientPnl(c, vendorMonthly(v)) };
  });

  return (
    <div>
      <PageHeader
        kicker="Money"
        title="Profit desk"
        action={
          <Button variant="outline" onClick={() => s.resetDemo()}>
            Reset demo data
          </Button>
        }
      >
        If a row does not move margin, keep, cost, or risk — it is a hobby. FX {s.fxZar} ZAR / USD.
      </PageHeader>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="MRR" value={usd(mrr)} hint={zar(mrr, s.fxZar)} />
        <Stat label="Vendor cost" value={usd(vendor)} />
        <Stat label="Tools / other" value={usd(tools)} />
        <Stat label="Gross profit" value={usd(gp)} hint={`${margin.toFixed(1)}% · pipeline ${usd(pipeline)}`} tone="gain" />
      </div>
      <div className="mt-8 overflow-x-auto rounded-xl bg-surface hair">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.12em] text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Client</th>
              <th className="px-4 py-3 font-medium">Revenue</th>
              <th className="px-4 py-3 font-medium">Vendor</th>
              <th className="px-4 py-3 font-medium">Tools</th>
              <th className="px-4 py-3 font-medium">GP</th>
              <th className="px-4 py-3 font-medium">Margin</th>
              <th className="px-4 py-3 font-medium">Flags</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ c, v, pnl }) => (
              <tr key={c.id} className="border-t border-line">
                <td className="px-4 py-3">
                  <Link to="/clients/$clientId" params={{ clientId: c.id }} className="hover:text-accent">
                    {c.company}
                  </Link>
                  <div className="text-xs text-muted">{v?.name}</div>
                </td>
                <td className="px-4 py-3 tabular">{usd(c.monthlyFeeUsd)}</td>
                <td className="px-4 py-3 tabular">{usd(pnl.vendor)}</td>
                <td className="px-4 py-3 tabular">{usd(c.toolCostUsd + c.otherCostUsd)}</td>
                <td className="px-4 py-3 tabular text-gain">{usd(pnl.gp)}</td>
                <td className={`px-4 py-3 tabular ${pnl.tone === "gain" ? "text-gain" : pnl.tone === "warn" ? "text-warn" : "text-loss"}`}>
                  {pnl.margin.toFixed(0)}%
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {c.invoiceStatus !== "current" ? <Badge tone="loss">{c.invoiceStatus.replace("_", " ")}</Badge> : null}
                    {c.status === "at_risk" ? <Badge tone="warn">at risk</Badge> : null}
                    {c.csat > 0 && c.csat < 4 ? <Badge tone="warn">CSAT</Badge> : null}
                    {pnl.margin < 40 ? <Badge tone="loss">thin</Badge> : null}
                    {(v?.performance ?? 100) < 80 ? <Badge tone="warn">vendor</Badge> : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
