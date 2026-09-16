import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { CopyButton } from "@/components/copy-button";
import { BIBLES, SCRIPT_TEMPLATES } from "@/lib/catalog";

export const Route = createFileRoute("/templates")({ component: TemplatesPage });

function TemplatesPage() {
  const [id, setId] = useState(BIBLES[0].id);
  const bible = BIBLES.find((b) => b.id === id)!;
  return (
    <div>
      <PageHeader kicker="Library" title="Bibles and scripts">
        Internal doctrine. Not a course. The rules the desk runs on.
      </PageHeader>
      <div className="flex flex-wrap gap-2">
        {BIBLES.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => setId(b.id)}
            className={`h-11 rounded-md px-3 text-sm ${b.id === id ? "bg-accent text-accent-fg" : "bg-surface hair"}`}
          >
            {b.title}
          </button>
        ))}
      </div>
      <article className="mt-6 rounded-xl bg-surface p-6 hair">
        <h2 className="font-display text-3xl">{bible.title}</h2>
        <p className="mt-1 text-sm text-muted">{bible.blurb}</p>
        <pre className="mt-5 whitespace-pre-wrap font-sans text-sm leading-relaxed">{bible.body}</pre>
      </article>
      <h2 className="mt-10 font-display text-2xl">Scripts</h2>
      <ul className="mt-4 grid gap-3 lg:grid-cols-2">
        {SCRIPT_TEMPLATES.map((t) => (
          <li key={t.id} className="rounded-xl bg-surface p-5 hair">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-muted">{t.kind}</p>
                <h3 className="font-display text-xl">{t.title}</h3>
              </div>
              <CopyButton text={t.body} />
            </div>
            <pre className="mt-3 whitespace-pre-wrap text-sm text-muted">{t.body}</pre>
          </li>
        ))}
      </ul>
    </div>
  );
}
