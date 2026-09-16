import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LeadForm } from "./leads";
import { useApex } from "@/lib/store";
import { STAGE_LABEL } from "@/lib/types";

export const Route = createFileRoute("/leads/$leadId")({ component: LeadDetail });

function LeadDetail() {
  const { leadId } = Route.useParams();
  const s = useApex();
  const lead = s.leads.find((l) => l.id === leadId);
  const deal = s.deals.find((d) => d.leadId === leadId);
  const audits = s.audits.filter((a) => a.leadId === leadId);
  const props = s.proposals.filter((p) => p.leadId === leadId);
  const [form, setForm] = useState(lead);
  if (!lead || !form) {
    return (
      <p className="text-muted">
        Lead not found. <Link to="/leads">Back</Link>
      </p>
    );
  }
  return (
    <div>
      <PageHeader
        kicker="Lead"
        title={lead.company}
        action={
          <>
            <Link to="/audit">
              <Button variant="outline">Run audit</Button>
            </Link>
            <Link to="/outreach">
              <Button variant="outline">Draft outreach</Button>
            </Link>
            <Button onClick={() => s.upsertLead(form)}>Save</Button>
          </>
        }
      >
        Score {lead.score} · {lead.country} · {STAGE_LABEL[lead.status]}
      </PageHeader>
      <div className="mb-6 flex flex-wrap gap-2">
        {lead.painPoints.map((p) => (
          <Badge key={p} tone="warn">
            {p}
          </Badge>
        ))}
        {lead.hiringSignal ? <Badge tone="info">Hiring</Badge> : null}
        {lead.outsourcingIntent ? <Badge tone="gain">Outsourcing intent</Badge> : null}
      </div>
      <LeadForm form={form} setForm={setForm} />
      {deal ? (
        <p className="mt-6 text-sm text-muted">
          Deal {deal.title} · {STAGE_LABEL[deal.stage]} · next {deal.nextAction}
        </p>
      ) : null}
      {audits[0] ? (
        <section className="mt-8 rounded-xl bg-surface p-5 hair">
          <h2 className="font-display text-xl">Latest audit</h2>
          <p className="mt-2 text-sm text-muted">{audits[0].business}</p>
          <p className="mt-2 text-sm">{audits[0].angle}</p>
        </section>
      ) : null}
      {props.length ? (
        <ul className="mt-4 text-sm">
          {props.map((p) => (
            <li key={p.id}>
              <Link to="/proposals/$proposalId" params={{ proposalId: p.id }} className="hover:text-accent">
                {p.title} · {p.status}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
