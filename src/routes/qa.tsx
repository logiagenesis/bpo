import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { todayIso, useApex } from "@/lib/store";
import type { QaReview } from "@/lib/types";
import { uid } from "@/lib/utils";

export const Route = createFileRoute("/qa")({ component: QaPage });

const KINDS: QaReview["kind"][] = ["calls", "tickets", "leads", "admin", "creative", "data_entry", "appointments"];

function QaPage() {
  const s = useApex();
  const [form, setForm] = useState<QaReview>(blank());
  const avg = s.qa.length ? Math.round(s.qa.reduce((a, q) => a + q.score, 0) / s.qa.length) : 0;

  return (
    <div>
      <PageHeader kicker="Run" title="QA scorecards">
        Below 80 is coaching. Below 70 is a PIP. Two PIPs and the vendor rotates. Average this period: {avg}.
      </PageHeader>
      <form
        className="mb-8 grid gap-3 rounded-xl bg-surface p-5 hair sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          s.upsertQa(form);
          const v = s.vendors.find((x) => x.id === form.vendorId);
          if (v) s.upsertVendor({ ...v, performance: Math.round(v.performance * 0.6 + form.score * 0.4) });
          if (form.score < 80) {
            s.upsertTask({
              id: uid("tsk"),
              title: `Coaching: ${v?.name ?? "vendor"} scored ${form.score}`,
              clientId: form.clientId,
              vendorId: form.vendorId,
              dueAt: todayIso(),
              status: "open",
              priority: form.score < 70 ? "high" : "normal",
              notes: form.coaching,
            });
          }
          setForm(blank());
        }}
      >
        <Field label="Kind">
          <Select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as QaReview["kind"] })}>
            {KINDS.map((k) => (
              <option key={k}>{k}</option>
            ))}
          </Select>
        </Field>
        <Field label="Score 0–100">
          <Input type="number" value={form.score} onChange={(e) => setForm({ ...form, score: Number(e.target.value) })} />
        </Field>
        <Field label="Client">
          <Select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}>
            {s.clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.company}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Vendor">
          <Select value={form.vendorId} onChange={(e) => setForm({ ...form, vendorId: e.target.value })}>
            {s.vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Mistakes" className="sm:col-span-2">
          <Textarea value={form.mistakes} onChange={(e) => setForm({ ...form, mistakes: e.target.value })} />
        </Field>
        <Field label="Coaching" className="sm:col-span-2">
          <Textarea value={form.coaching} onChange={(e) => setForm({ ...form, coaching: e.target.value })} />
        </Field>
        <Field label="Client impact">
          <Input value={form.clientImpact} onChange={(e) => setForm({ ...form, clientImpact: e.target.value })} />
        </Field>
        <Field label="Follow-up">
          <Input value={form.followUp} onChange={(e) => setForm({ ...form, followUp: e.target.value })} />
        </Field>
        <Button type="submit">Log review</Button>
      </form>
      <ul className="space-y-3">
        {s.qa.map((q) => (
          <li key={q.id} className="rounded-xl bg-surface p-5 hair">
            <div className="flex justify-between gap-3">
              <div>
                <p className="font-display text-xl">
                  {s.clients.find((c) => c.id === q.clientId)?.company} · {q.kind}
                </p>
                <p className="text-xs text-muted">
                  {s.vendors.find((v) => v.id === q.vendorId)?.name} · {q.createdAt}
                </p>
              </div>
              <p className={`font-display text-3xl tabular ${q.score < 80 ? "text-loss" : "text-gain"}`}>{q.score}</p>
            </div>
            <p className="mt-3 text-sm">{q.mistakes}</p>
            <p className="mt-1 text-sm text-muted">{q.coaching}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function blank(): QaReview {
  return {
    id: uid("qa"),
    kind: "tickets",
    clientId: "cli-02",
    vendorId: "ven-02",
    score: 85,
    mistakes: "",
    coaching: "",
    clientImpact: "",
    followUp: "",
    createdAt: todayIso(),
  };
}
