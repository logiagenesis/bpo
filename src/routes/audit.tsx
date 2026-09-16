import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { CopyButton } from "@/components/copy-button";
import { Badge } from "@/components/ui/badge";
import { runAudit } from "@/lib/ai.functions";
import { usd } from "@/lib/money";
import { todayIso, useApex } from "@/lib/store";
import { uid } from "@/lib/utils";
import { asArr, asNum, asStr, extractJson } from "@/lib/json";
import type { AuditResult } from "@/lib/types";

export const Route = createFileRoute("/audit")({ component: AuditPage });

function AuditPage() {
  const s = useApex();
  const [leadId, setLeadId] = useState(s.leads.find((l) => l.status !== "won" && l.status !== "lost")?.id ?? s.leads[0]?.id ?? "");
  const lead = s.leads.find((l) => l.id === leadId);
  const [url, setUrl] = useState(lead?.website ?? "");
  const [notes, setNotes] = useState(lead?.notes ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const latest = s.audits.find((a) => a.leadId === leadId) ?? s.audits[0];

  async function run() {
    setBusy(true);
    setError("");
    const res = await runAudit({ data: { url, notes, company: lead?.company || "" } });
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    const j = res.ok ? extractJson(res.text) ?? {} : {};
    const audit: AuditResult = {
      id: uid("aud"),
      leadId,
      url,
      business: asStr(j.business) || res.text.slice(0, 280),
      bottlenecks: asArr(j.bottlenecks),
      opportunities: asArr(j.opportunities),
      package: asStr(j.package),
      monthlyValueUsd: asNum(j.monthlyValueUsd),
      angle: asStr(j.angle),
      emailDraft: asStr(j.emailDraft),
      linkedinDraft: asStr(j.linkedinDraft),
      callOpener: asStr(j.callOpener),
      proposalSummary: asStr(j.proposalSummary),
      createdAt: todayIso(),
    };
    s.addAudit(audit);
    if (lead) {
      s.upsertLead({
        ...lead,
        website: url || lead.website,
        notes,
        painPoints: asArr(j.painPoints).length ? asArr(j.painPoints) : lead.painPoints,
        suggestedOffer: asStr(j.suggestedOffer) || lead.suggestedOffer,
        status: lead.status === "new_lead" ? "researched" : lead.status,
      });
    }
    s.log("audit", audit.id, `Audited ${lead?.company || url}`);
  }

  return (
    <div>
      <PageHeader kicker="Win" title="Client audit">
        Paste a URL. We read what we can, then write the problem, the offer, and the first drafts. You send them.
      </PageHeader>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <form
          className="rounded-xl bg-surface p-5 hair"
          onSubmit={(e) => {
            e.preventDefault();
            void run();
          }}
        >
          <Field label="Lead">
            <Select
              value={leadId}
              onChange={(e) => {
                const id = e.target.value;
                setLeadId(id);
                const l = s.leads.find((x) => x.id === id);
                setUrl(l?.website ?? "");
                setNotes(l?.notes ?? "");
              }}
            >
              {s.leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.company}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Website" className="mt-3">
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" />
          </Field>
          <Field label="Notes" className="mt-3">
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>
          {error ? <p className="mt-3 text-sm text-loss">{error}</p> : null}
          <Button type="submit" className="mt-4" disabled={busy}>
            {busy ? "Reading…" : "Run audit"}
          </Button>
        </form>

        {latest ? (
          <article className="rounded-xl bg-surface p-5 hair">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-display text-2xl">{s.leads.find((l) => l.id === latest.leadId)?.company}</h2>
              <Badge tone="gain">{usd(latest.monthlyValueUsd)}/mo</Badge>
            </div>
            <p className="mt-3 text-sm text-muted">{latest.business}</p>
            <h3 className="mt-5 text-xs uppercase tracking-[0.16em] text-muted">Bottlenecks</h3>
            <ul className="mt-2 list-disc pl-5 text-sm">
              {latest.bottlenecks.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            <h3 className="mt-5 text-xs uppercase tracking-[0.16em] text-muted">Offer</h3>
            <p className="mt-2 text-sm">{latest.package}</p>
            <p className="mt-2 text-sm text-fg">{latest.angle}</p>
            <Draft title="Email" body={latest.emailDraft} />
            <Draft title="LinkedIn" body={latest.linkedinDraft} />
            <Draft title="Call opener" body={latest.callOpener} />
            <p className="mt-4 text-sm text-muted">{latest.proposalSummary}</p>
            <Link to="/outreach" className="mt-4 inline-block text-sm text-accent hover:text-fg">
              Take this to outreach
            </Link>
          </article>
        ) : (
          <p className="text-sm text-muted">No audit yet. Run one on the hottest lead.</p>
        )}
      </div>
    </div>
  );
}

function Draft({ title, body }: { title: string; body: string }) {
  if (!body) return null;
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs uppercase tracking-[0.16em] text-muted">{title}</h3>
        <CopyButton text={body} />
      </div>
      <pre className="mt-2 whitespace-pre-wrap rounded-md bg-raised p-3 text-sm text-fg">{body}</pre>
    </div>
  );
}
