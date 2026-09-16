import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { blankLead, scoreLead, todayIso, useApex } from "@/lib/store";
import { STAGE_LABEL, type Lead, type PipelineStage } from "@/lib/types";
import { parseCsv } from "@/lib/utils";

export const Route = createFileRoute("/leads")({ component: LeadsPage });

function LeadsPage() {
  const s = useApex();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [csvOpen, setCsvOpen] = useState(false);
  const [form, setForm] = useState<Lead>(blankLead());
  const [csv, setCsv] = useState("");
  const [imported, setImported] = useState<number | null>(null);

  const rows = useMemo(() => {
    const t = q.toLowerCase();
    return s.leads.filter(
      (l) =>
        !t ||
        l.company.toLowerCase().includes(t) ||
        l.contactName.toLowerCase().includes(t) ||
        l.industry.toLowerCase().includes(t) ||
        l.country.toLowerCase().includes(t),
    );
  }, [s.leads, q]);

  function save() {
    const scored = {
      ...form,
      score: scoreLead({
        hiringSignal: form.hiringSignal,
        outsourcingIntent: form.outsourcingIntent,
        employees: form.employees,
        website: form.website,
        email: form.email,
        linkedin: form.linkedin,
        painPoints: form.painPoints,
        industryMatch: true,
      }),
    };
    s.upsertLead(scored);
    if (!s.deals.some((d) => d.leadId === scored.id)) {
      s.upsertDeal({
        id: `deal-${scored.id}`,
        leadId: scored.id,
        title: `${scored.company} · ${scored.suggestedOffer || "new"}`,
        stage: scored.status,
        valueUsd: 0,
        probability: 10,
        expectedClose: todayIso(),
        nextAction: scored.nextAction,
        owner: "You",
        notes: "",
        lostReason: "",
        createdAt: todayIso(),
      });
    }
    s.log("lead", scored.id, `Saved ${scored.company} (score ${scored.score})`);
    setOpen(false);
  }

  function doImport() {
    const recs = parseCsv(csv);
    const leads: Lead[] = recs.map((r) => {
      const l = blankLead();
      l.company = r.company || r.company_name || r.name || "Untitled";
      l.website = r.website || r.url || "";
      l.country = r.country || "";
      l.industry = r.industry || "";
      l.contactName = r.contact || r.contact_name || r.name || "";
      l.contactTitle = r.title || r.contact_title || "";
      l.email = r.email || "";
      l.linkedin = r.linkedin || "";
      l.phone = r.phone || "";
      l.source = r.source || "CSV";
      l.notes = r.notes || "";
      l.score = scoreLead({
        hiringSignal: /true|yes|1/i.test(r.hiring || r.hiring_signal || ""),
        outsourcingIntent: /true|yes|1/i.test(r.outsourcing || ""),
        employees: r.employees || "11-50",
        website: l.website,
        email: l.email,
        linkedin: l.linkedin,
        painPoints: [],
        industryMatch: false,
      });
      return l;
    });
    const n = s.importLeads(leads);
    setImported(n);
  }

  return (
    <div>
      <PageHeader
        kicker="Win"
        title="Leads"
        action={
          <>
            <Button variant="outline" onClick={() => setCsvOpen(true)}>
              Import CSV
            </Button>
            <Button
              onClick={() => {
                setForm(blankLead());
                setOpen(true);
              }}
            >
              Add lead
            </Button>
          </>
        }
      >
        Score is computed from hiring signals, outsourcing intent, size, and completeness. Highest score first is the money path.
      </PageHeader>

      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter company, contact, industry" className="mb-4 max-w-md" />

      <div className="overflow-x-auto rounded-xl bg-surface hair">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.12em] text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Score</th>
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Stage</th>
              <th className="px-4 py-3 font-medium">Next</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((l) => (
              <tr key={l.id} className="border-t border-line">
                <td className="px-4 py-3 tabular text-accent">{l.score}</td>
                <td className="px-4 py-3">
                  <Link to="/leads/$leadId" params={{ leadId: l.id }} className="hover:text-accent">
                    {l.company}
                  </Link>
                  <div className="text-xs text-muted">
                    {l.country} · {l.industry}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {l.contactName}
                  <div className="text-xs text-muted">{l.contactTitle}</div>
                </td>
                <td className="px-4 py-3">
                  <Badge>{STAGE_LABEL[l.status]}</Badge>
                </td>
                <td className="px-4 py-3 text-muted">{l.nextAction}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} title="New lead" wide>
        <LeadForm form={form} setForm={setForm} />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={save} disabled={!form.company}>
            Save lead
          </Button>
        </div>
      </Dialog>

      <Dialog open={csvOpen} onClose={() => setCsvOpen(false)} title="Import CSV">
        <p className="mb-3 text-sm text-muted">
          Headers: company, website, country, industry, contact_name, title, email, linkedin, phone, source, notes, employees, hiring_signal, outsourcing
        </p>
        <Textarea value={csv} onChange={(e) => setCsv(e.target.value)} placeholder="company,website,email..." />
        {imported !== null ? <p className="mt-2 text-sm text-gain">{imported} new rows added.</p> : null}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setCsvOpen(false)}>
            Close
          </Button>
          <Button onClick={doImport}>Import</Button>
        </div>
      </Dialog>
    </div>
  );
}

export function LeadForm({ form, setForm }: { form: Lead; setForm: (l: Lead) => void }) {
  const set = (k: keyof Lead, v: unknown) => setForm({ ...form, [k]: v });
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label="Company">
        <Input value={form.company} onChange={(e) => set("company", e.target.value)} />
      </Field>
      <Field label="Website">
        <Input value={form.website} onChange={(e) => set("website", e.target.value)} />
      </Field>
      <Field label="Country">
        <Input value={form.country} onChange={(e) => set("country", e.target.value)} />
      </Field>
      <Field label="Industry">
        <Input value={form.industry} onChange={(e) => set("industry", e.target.value)} />
      </Field>
      <Field label="Contact">
        <Input value={form.contactName} onChange={(e) => set("contactName", e.target.value)} />
      </Field>
      <Field label="Title">
        <Input value={form.contactTitle} onChange={(e) => set("contactTitle", e.target.value)} />
      </Field>
      <Field label="Email">
        <Input value={form.email} onChange={(e) => set("email", e.target.value)} />
      </Field>
      <Field label="LinkedIn">
        <Input value={form.linkedin} onChange={(e) => set("linkedin", e.target.value)} />
      </Field>
      <Field label="Phone">
        <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
      </Field>
      <Field label="Source">
        <Input value={form.source} onChange={(e) => set("source", e.target.value)} />
      </Field>
      <Field label="Employees">
        <Select value={form.employees} onChange={(e) => set("employees", e.target.value)}>
          {["1-10", "11-50", "51-200", "201-1000", "1000+"].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </Select>
      </Field>
      <Field label="Stage">
        <Select value={form.status} onChange={(e) => set("status", e.target.value as PipelineStage)}>
          {Object.entries(STAGE_LABEL).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Suggested offer" className="sm:col-span-2">
        <Input value={form.suggestedOffer} onChange={(e) => set("suggestedOffer", e.target.value)} />
      </Field>
      <Field label="Pain points (comma)" className="sm:col-span-2">
        <Input value={form.painPoints.join(", ")} onChange={(e) => set("painPoints", e.target.value.split(",").map((x) => x.trim()).filter(Boolean))} />
      </Field>
      <Field label="Notes" className="sm:col-span-2">
        <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} />
      </Field>
      <label className="flex h-11 items-center gap-2 text-sm">
        <input type="checkbox" checked={form.hiringSignal} onChange={(e) => set("hiringSignal", e.target.checked)} />
        Hiring signal
      </label>
      <label className="flex h-11 items-center gap-2 text-sm">
        <input type="checkbox" checked={form.outsourcingIntent} onChange={(e) => set("outsourcingIntent", e.target.checked)} />
        Outsourcing intent
      </label>
    </div>
  );
}
