import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { usd } from "@/lib/money";
import { useApex } from "@/lib/store";
import { PIPELINE_STAGES, STAGE_LABEL, type PipelineStage } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pipeline")({ component: PipelinePage });

const OPEN = PIPELINE_STAGES.filter((s) => s !== "won" && s !== "lost");

function PipelinePage() {
  const s = useApex();
  return (
    <div>
      <PageHeader kicker="Win" title="Pipeline">
        Drag-free board. Move a deal when the work is done — not when you feel busy. Won creates a client and blocks vendor work until setup is paid.
      </PageHeader>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {OPEN.map((stage) => {
          const deals = s.deals.filter((d) => d.stage === stage);
          const sum = deals.reduce((a, d) => a + d.valueUsd, 0);
          return (
            <section key={stage} className="w-64 shrink-0 rounded-xl bg-surface p-3 hair">
              <header className="mb-3 flex items-baseline justify-between">
                <h2 className="text-sm text-fg">{STAGE_LABEL[stage]}</h2>
                <span className="text-xs tabular text-muted">{usd(sum)}</span>
              </header>
              <ul className="flex flex-col gap-2">
                {deals.map((d) => {
                  const lead = s.leads.find((l) => l.id === d.leadId);
                  return (
                    <li key={d.id} className="rounded-lg bg-raised p-3">
                      <Link to="/leads/$leadId" params={{ leadId: d.leadId }} className="text-sm text-fg hover:text-accent">
                        {lead?.company ?? d.title}
                      </Link>
                      <p className="mt-1 text-xs tabular text-muted">
                        {usd(d.valueUsd)} · {d.probability}%
                      </p>
                      <p className="mt-1 text-xs text-faint">{d.nextAction}</p>
                      <div className="mt-2 flex gap-1">
                        <Move id={d.id} stage={stage} dir={-1} />
                        <Move id={d.id} stage={stage} dir={1} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Closed title="Won" stage="won" />
        <Closed title="Lost" stage="lost" />
      </div>
    </div>
  );
}

function Move({ id, stage, dir }: { id: string; stage: PipelineStage; dir: -1 | 1 }) {
  const s = useApex();
  const i = OPEN.indexOf(stage as (typeof OPEN)[number]);
  const next = OPEN[i + dir];
  if (!next) {
    if (dir === 1) {
      return (
        <button type="button" className="h-9 rounded-md px-2 text-xs text-gain hover:bg-gain/10" onClick={() => s.moveDeal(id, "won")}>
          Mark won
        </button>
      );
    }
    return null;
  }
  return (
    <button
      type="button"
      className={cn("h-9 rounded-md px-2 text-xs text-muted hover:bg-line hover:text-fg")}
      onClick={() => s.moveDeal(id, next)}
    >
      {dir === 1 ? "Advance" : "Back"}
    </button>
  );
}

function Closed({ title, stage }: { title: string; stage: "won" | "lost" }) {
  const s = useApex();
  const deals = s.deals.filter((d) => d.stage === stage);
  return (
    <section className="rounded-xl bg-surface p-4 hair">
      <h2 className="font-display text-xl">{title}</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {deals.map((d) => {
          const lead = s.leads.find((l) => l.id === d.leadId);
          return (
            <li key={d.id} className="flex justify-between gap-3">
              <span>{lead?.company}</span>
              <span className="tabular text-muted">
                {usd(d.valueUsd)}
                {d.lostReason ? ` · ${d.lostReason}` : ""}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
