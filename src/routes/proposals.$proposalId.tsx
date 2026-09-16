import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { ApexMark } from "@/components/mark";
import { useApex } from "@/lib/store";
import type { Proposal } from "@/lib/types";
import { usd } from "@/lib/money";

export const Route = createFileRoute("/proposals/$proposalId")({ component: ProposalDetail });

function ProposalDetail() {
  const { proposalId } = Route.useParams();
  const s = useApex();
  const found = s.proposals.find((p) => p.id === proposalId);
  const [p, setP] = useState(found);
  if (!found || !p) {
    return (
      <p className="text-muted">
        Missing. <Link to="/proposals">Back</Link>
      </p>
    );
  }
  const lead = s.leads.find((l) => l.id === p.leadId);
  const offer = s.offers.find((o) => o.id === p.offerId);
  const set = (k: keyof Proposal, v: string) => setP({ ...p, [k]: v });

  return (
    <div>
      <PageHeader
        kicker="Proposal"
        title={p.title}
        action={
          <>
            <Button
              variant="outline"
              onClick={() => {
                s.upsertProposal(p);
              }}
            >
              Save
            </Button>
            <Button onClick={() => window.print()}>Print / PDF</Button>
          </>
        }
      >
        {lead?.company} · {offer?.name} · {offer ? usd(offer.priceUsd) + "/mo" : ""}
      </PageHeader>

      <div className="grid gap-3 lg:grid-cols-2 print:hidden">
        {(
          [
            ["title", "Title"],
            ["problem", "Problem"],
            ["solution", "Solution"],
            ["deliverables", "Deliverables"],
            ["timeline", "Timeline"],
            ["pricing", "Pricing"],
            ["sla", "SLA"],
            ["reporting", "Reporting"],
            ["terms", "Terms"],
            ["nextSteps", "Next steps"],
          ] as const
        ).map(([k, label]) => (
          <Field key={k} label={label} className={k === "title" ? "lg:col-span-2" : ""}>
            {k === "title" ? (
              <Input value={p[k]} onChange={(e) => set(k, e.target.value)} />
            ) : (
              <Textarea value={p[k]} onChange={(e) => set(k, e.target.value)} />
            )}
          </Field>
        ))}
        <Field label="Status">
          <Select value={p.status} onChange={(e) => setP({ ...p, status: e.target.value as Proposal["status"] })}>
            {["draft", "sent", "accepted", "declined"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </Select>
        </Field>
      </div>

      <article className="mt-10 rounded-xl bg-surface p-8 hair print:bg-white print:text-black print:shadow-none">
        <header className="flex items-center justify-between border-b border-line pb-4">
          <div className="flex items-center gap-2">
            <ApexMark className="size-6" />
            <span className="font-display text-2xl">Apexline</span>
          </div>
          <p className="text-sm text-muted">{p.createdAt}</p>
        </header>
        <h2 className="mt-6 font-display text-3xl">{p.title}</h2>
        <p className="mt-1 text-sm text-muted">Prepared for {lead?.contactName}, {lead?.company}</p>
        <Sec title="The problem" body={p.problem} />
        <Sec title="The path" body={p.solution} />
        <Sec title="Deliverables" body={p.deliverables} />
        <Sec title="Timeline" body={p.timeline} />
        <Sec title="Price" body={p.pricing} />
        <Sec title="SLA" body={p.sla} />
        <Sec title="Reporting" body={p.reporting} />
        <Sec title="Terms" body={p.terms} />
        <Sec title="Next step" body={p.nextSteps} />
        <p className="mt-8 text-xs text-faint">Work starts when setup and month 1 clear. Apexline vendors do not speak to the client unless named in writing.</p>
      </article>
    </div>
  );
}

function Sec({ title, body }: { title: string; body: string }) {
  if (!body) return null;
  return (
    <section className="mt-6">
      <h3 className="text-xs uppercase tracking-[0.16em] text-muted">{title}</h3>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{body}</p>
    </section>
  );
}
