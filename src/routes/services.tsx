import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NICHES } from "@/lib/catalog";
import { marginPct, usd } from "@/lib/money";
import { SERVICE_LABEL } from "@/lib/types";

export const Route = createFileRoute("/services")({ component: ServicesPage });

function ServicesPage() {
  return (
    <div>
      <PageHeader kicker="Library" title="Niches">
        Pick one. Build the SOP. Do not sell ten things on day one.
      </PageHeader>
      <div className="grid gap-3 lg:grid-cols-2">
        {NICHES.map((n) => {
          const m = marginPct(n.typicalClientUsd, n.typicalClientUsd - n.typicalVendorUsd);
          return (
            <article key={n.id} className="rounded-xl bg-surface p-5 hair">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-display text-2xl">{SERVICE_LABEL[n.id]}</h2>
                <Badge tone={m >= 50 ? "gain" : "warn"}>{m.toFixed(0)}% typical</Badge>
              </div>
              <p className="mt-3 text-sm text-fg">{n.pitch}</p>
              <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-[0.14em] text-muted">Client pays</dt>
                  <dd className="tabular">{usd(n.typicalClientUsd)}/mo</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.14em] text-muted">Vendor</dt>
                  <dd className="tabular">{usd(n.typicalVendorUsd)}/mo</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.14em] text-muted">Demand</dt>
                  <dd>{n.demand}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.14em] text-muted">Difficulty</dt>
                  <dd>{n.difficulty}</dd>
                </div>
              </dl>
              <p className="mt-3 text-xs text-muted">{n.skills}</p>
              <Link to="/offers" className="mt-4 inline-block">
                <Button variant="outline" size="sm">
                  Build this offer
                </Button>
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
}
