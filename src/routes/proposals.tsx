import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Field, Select } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { runProposal } from "@/lib/ai.functions";
import { todayIso, useApex } from "@/lib/store";
import type { Proposal } from "@/lib/types";
import { uid } from "@/lib/utils";
import { asStr, extractJson } from "@/lib/json";

export const Route = createFileRoute("/proposals")({ component: ProposalsPage });

function ProposalsPage() {
  const s = useApex();
  const [leadId, setLeadId] = useState(s.leads.find((l) => l.status === "call_booked" || l.status === "proposal_sent" || l.status === "negotiation")?.id ?? s.leads[0]?.id ?? "");
  const [offerId, setOfferId] = useState(s.offers[0]?.id ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    const lead = s.leads.find((l) => l.id === leadId);
    const offer = s.offers.find((o) => o.id === offerId);
    if (!lead || !offer) return;
    setBusy(true);
    setError("");
    const res = await runProposal({ data: { lead: JSON.stringify(lead), offer: JSON.stringify(offer) } });
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    const j = extractJson(res.text) ?? {};
    const p: Proposal = {
      id: uid("prop"),
      leadId,
      offerId,
      title: asStr(j.title) || `${lead.company} — ${offer.name}`,
      problem: asStr(j.problem),
      solution: asStr(j.solution),
      deliverables: asStr(j.deliverables) || offer.deliverables,
      timeline: asStr(j.timeline) || offer.timeline,
      pricing: asStr(j.pricing) || `Setup plus ${offer.priceUsd} USD / month. Paid before work starts.`,
      sla: asStr(j.sla),
      reporting: asStr(j.reporting) || "Friday report.",
      terms: asStr(j.terms),
      nextSteps: asStr(j.nextSteps),
      status: "draft",
      createdAt: todayIso(),
    };
    s.upsertProposal(p);
    s.setLeadStatus(leadId, "proposal_sent");
    s.log("proposal", p.id, `Drafted ${p.title}`);
  }

  return (
    <div>
      <PageHeader kicker="Win" title="Proposals">
        Pain, path, price, proof, next step. Export prints to PDF from the browser.
      </PageHeader>
      <div className="mb-6 grid gap-3 rounded-xl bg-surface p-5 hair sm:grid-cols-3">
        <Field label="Lead">
          <Select value={leadId} onChange={(e) => setLeadId(e.target.value)}>
            {s.leads.map((l) => (
              <option key={l.id} value={l.id}>
                {l.company}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Offer">
          <Select value={offerId} onChange={(e) => setOfferId(e.target.value)}>
            {s.offers.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </Select>
        </Field>
        <div className="flex items-end">
          <Button onClick={() => void generate()} disabled={busy}>
            {busy ? "Writing…" : "Generate draft"}
          </Button>
        </div>
        {error ? <p className="sm:col-span-3 text-sm text-loss">{error}</p> : null}
      </div>
      <ul className="divide-y divide-line rounded-xl bg-surface hair">
        {s.proposals.map((p) => {
          const lead = s.leads.find((l) => l.id === p.leadId);
          return (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
              <div>
                <Link to="/proposals/$proposalId" params={{ proposalId: p.id }} className="text-fg hover:text-accent">
                  {p.title}
                </Link>
                <p className="text-xs text-muted">
                  {lead?.company} · {p.createdAt}
                </p>
              </div>
              <Badge tone={p.status === "accepted" ? "gain" : p.status === "declined" ? "loss" : "muted"}>{p.status}</Badge>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
