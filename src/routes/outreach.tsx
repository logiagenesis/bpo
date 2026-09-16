import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Field, Select, Textarea } from "@/components/ui/field";
import { CopyButton } from "@/components/copy-button";
import { runJobDraft, runOutreach } from "@/lib/ai.functions";
import { todayIso, useApex } from "@/lib/store";
import { TONE_LABEL, TONES, type OutreachDraft, type Tone } from "@/lib/types";
import { uid } from "@/lib/utils";

export const Route = createFileRoute("/outreach")({ component: OutreachPage });

function OutreachPage() {
  const s = useApex();
  const [leadId, setLeadId] = useState(s.leads.find((l) => l.status !== "won")?.id ?? "");
  const [tone, setTone] = useState<Tone>("direct");
  const [channel, setChannel] = useState<OutreachDraft["channel"]>("email");
  const [job, setJob] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const lead = s.leads.find((l) => l.id === leadId);
  const offer = s.offers[0];
  const drafts = s.outreach.filter((o) => !leadId || o.leadId === leadId);

  async function generate() {
    if (!lead) return;
    setBusy(true);
    setError("");
    const res = await runOutreach({
      data: {
        lead: JSON.stringify(lead),
        tone,
        channel,
        offer: JSON.stringify(offer),
      },
    });
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    const text = res.text.trim();
    const subject = text.match(/^Subject:\s*(.*)$/im)?.[1] ?? `${lead.company}`;
    const body = text.replace(/^Subject:.*\n+/i, "");
    s.addOutreach({
      id: uid("out"),
      leadId: lead.id,
      tone,
      channel,
      subject,
      body,
      createdAt: todayIso(),
    });
    if (lead.status === "researched" || lead.status === "new_lead") s.setLeadStatus(lead.id, "contacted");
  }

  async function fromJob() {
    setBusy(true);
    setError("");
    const res = await runJobDraft({ data: { job, offer: JSON.stringify(offer), tone } });
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    s.addOutreach({
      id: uid("out"),
      leadId: leadId || "job",
      tone,
      channel: "job_board",
      subject: "Job-board draft",
      body: res.text,
      createdAt: todayIso(),
    });
  }

  return (
    <div>
      <PageHeader kicker="Win" title="Outreach drafts">
        Apexline writes. You copy. You send. There is no auto-bid, no mailbox send, no unattended sequence.
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-2">
        <form
          className="rounded-xl bg-surface p-5 hair"
          onSubmit={(e) => {
            e.preventDefault();
            void generate();
          }}
        >
          <h2 className="font-display text-xl">From a lead</h2>
          <Field label="Lead" className="mt-3">
            <Select value={leadId} onChange={(e) => setLeadId(e.target.value)}>
              {s.leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.company}
                </option>
              ))}
            </Select>
          </Field>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Field label="Tone">
              <Select value={tone} onChange={(e) => setTone(e.target.value as Tone)}>
                {TONES.map((t) => (
                  <option key={t} value={t}>
                    {TONE_LABEL[t]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Channel">
              <Select value={channel} onChange={(e) => setChannel(e.target.value as OutreachDraft["channel"])}>
                <option value="email">Email</option>
                <option value="linkedin">LinkedIn</option>
                <option value="call">Call script</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="job_board">Job board</option>
              </Select>
            </Field>
          </div>
          {error ? <p className="mt-3 text-sm text-loss">{error}</p> : null}
          <Button type="submit" className="mt-4" disabled={busy}>
            {busy ? "Drafting…" : "Draft (do not send)"}
          </Button>
        </form>

        <form
          className="rounded-xl bg-surface p-5 hair"
          onSubmit={(e) => {
            e.preventDefault();
            void fromJob();
          }}
        >
          <h2 className="font-display text-xl">Paste a job post</h2>
          <p className="mt-1 text-sm text-muted">You will paste the reply into the platform yourself.</p>
          <Field label="Job description" className="mt-3">
            <Textarea value={job} onChange={(e) => setJob(e.target.value)} className="min-h-40" />
          </Field>
          <Button type="submit" className="mt-4" variant="outline" disabled={busy || !job.trim()}>
            Draft a reply
          </Button>
        </form>
      </div>

      <ul className="mt-8 space-y-4">
        {drafts.map((d) => (
          <li key={d.id} className="rounded-xl bg-surface p-5 hair">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm text-muted">
                  {d.channel} · {TONE_LABEL[d.tone]} · {s.leads.find((l) => l.id === d.leadId)?.company ?? "Job"}
                </p>
                <p className="font-display text-xl">{d.subject}</p>
              </div>
              <CopyButton text={`${d.subject}\n\n${d.body}`} />
            </div>
            <pre className="mt-3 whitespace-pre-wrap text-sm text-fg">{d.body}</pre>
          </li>
        ))}
      </ul>
    </div>
  );
}
