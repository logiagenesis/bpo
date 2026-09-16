import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { clientPnl, usd } from "@/lib/money";
import { useApex, vendorMonthly } from "@/lib/store";

export const Route = createFileRoute("/clients")({ component: ClientsPage });

function ClientsPage() {
  const s = useApex();
  return (
    <div>
      <PageHeader kicker="Run" title="Clients">
        Live retainers. Invoice status sits next to margin on purpose.
      </PageHeader>
      <div className="overflow-x-auto rounded-xl bg-surface hair">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.12em] text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Client</th>
              <th className="px-4 py-3 font-medium">Fee</th>
              <th className="px-4 py-3 font-medium">Margin</th>
              <th className="px-4 py-3 font-medium">CSAT</th>
              <th className="px-4 py-3 font-medium">Invoice</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {s.clients.map((c) => {
              const v = s.vendors.find((x) => x.id === c.vendorId);
              const pnl = clientPnl(c, vendorMonthly(v), s.fees);
              return (
                <tr key={c.id} className="border-t border-line">
                  <td className="px-4 py-3">
                    <Link to="/clients/$clientId" params={{ clientId: c.id }} className="hover:text-accent">
                      {c.company}
                    </Link>
                    <div className="text-xs text-muted">{c.contactName}</div>
                  </td>
                  <td className="px-4 py-3 tabular">{usd(c.monthlyFeeUsd)}</td>
                  <td className={`px-4 py-3 tabular ${pnl.tone === "gain" ? "text-gain" : "text-loss"}`}>{pnl.margin.toFixed(0)}%</td>
                  <td className="px-4 py-3 tabular">{c.csat || "—"}</td>
                  <td className="px-4 py-3">
                    <Badge tone={c.invoiceStatus === "current" ? "gain" : "loss"}>{c.invoiceStatus.replace("_", " ")}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={c.status === "at_risk" ? "warn" : "muted"}>{c.status.replace("_", " ")}</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
