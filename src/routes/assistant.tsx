import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { runAssistant } from "@/lib/ai.functions";
import { kpis, useApex } from "@/lib/store";

export const Route = createFileRoute("/assistant")({ component: AssistantPage });

const PROMPTS = [
  "What should I do today?",
  "Which lead should I contact first?",
  "Which client is most profitable?",
  "Which client is at risk?",
  "Where am I losing margin?",
];

function AssistantPage() {
  const s = useApex();
  const snap = snapshot(s);
  const [q, setQ] = useState(PROMPTS[0]);
  const [a, setA] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function ask(question: string) {
    setBusy(true);
    setError("");
    const res = await runAssistant({ data: { question, snapshot: snap } });
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setA(res.text);
  }

  return (
    <div>
      <PageHeader kicker="Library" title="Desk assistant">
        Uses the live workspace snapshot. It will not send anything. It will tell you who to chase.
      </PageHeader>
      <div className="flex flex-wrap gap-2">
        {PROMPTS.map((p) => (
          <button
            key={p}
            type="button"
            className="h-11 rounded-md bg-surface px-3 text-sm hair hover:bg-raised"
            onClick={() => {
              setQ(p);
              void ask(p);
            }}
          >
            {p}
          </button>
        ))}
      </div>
      <form
        className="mt-4"
        onSubmit={(e) => {
          e.preventDefault();
          void ask(q);
        }}
      >
        <Textarea value={q} onChange={(e) => setQ(e.target.value)} />
        {error ? <p className="mt-2 text-sm text-loss">{error}</p> : null}
        <Button type="submit" className="mt-3" disabled={busy}>
          {busy ? "Thinking…" : "Ask"}
        </Button>
      </form>
      {a ? <pre className="mt-6 whitespace-pre-wrap rounded-xl bg-surface p-5 text-sm leading-relaxed hair">{a}</pre> : null}
    </div>
  );
}

function snapshot(s: ReturnType<typeof useApex.getState>) {
  const k = kpis(s);
  return JSON.stringify(
    {
      mrr: k.mrr,
      margin: k.margin,
      gp: k.gp,
      dueToday: k.dueToday.map((t) => t.title),
      hot: k.hot.slice(0, 5).map((l) => ({ company: l.company, score: l.score, next: l.nextAction, status: l.status })),
      atRisk: k.atRisk.map((c) => ({ company: c.company, csat: c.csat, invoice: c.invoiceStatus, status: c.status })),
      clients: s.clients.map((c) => ({ company: c.company, fee: c.monthlyFeeUsd, status: c.status, invoice: c.invoiceStatus })),
      vendors: s.vendors.map((v) => ({ name: v.name, performance: v.performance, availability: v.availability })),
    },
    null,
    2,
  );
}
