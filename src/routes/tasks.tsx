import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { todayIso, useApex } from "@/lib/store";
import type { Task } from "@/lib/types";
import { uid } from "@/lib/utils";

export const Route = createFileRoute("/tasks")({ component: TasksPage });

function TasksPage() {
  const s = useApex();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Task>(blankTask());
  const openTasks = s.tasks.filter((t) => t.status !== "done");
  const done = s.tasks.filter((t) => t.status === "done");

  return (
    <div>
      <PageHeader
        kicker="Run"
        title="Tasks"
        action={
          <Button
            onClick={() => {
              setForm(blankTask());
              setOpen(true);
            }}
          >
            Add task
          </Button>
        }
      >
        Due dates are the operating calendar. High priority first.
      </PageHeader>
      <List
        items={openTasks}
        onToggle={(t) => s.upsertTask({ ...t, status: t.status === "done" ? "open" : "done" })}
        onEdit={(t) => {
          setForm(t);
          setOpen(true);
        }}
      />
      {done.length ? (
        <div className="mt-8">
          <h2 className="mb-3 font-display text-xl">Done</h2>
          <List items={done} onToggle={(t) => s.upsertTask({ ...t, status: "open" })} onEdit={(t) => { setForm(t); setOpen(true); }} />
        </div>
      ) : null}
      <Dialog open={open} onClose={() => setOpen(false)} title="Task">
        <div className="grid gap-3">
          <Field label="Title">
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <Field label="Due">
            <Input type="date" value={form.dueAt} onChange={(e) => setForm({ ...form, dueAt: e.target.value })} />
          </Field>
          <Field label="Priority">
            <Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Task["priority"] })}>
              <option>low</option>
              <option>normal</option>
              <option>high</option>
            </Select>
          </Field>
          <Field label="Client">
            <Select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}>
              <option value="">—</option>
              {s.clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Vendor">
            <Select value={form.vendorId} onChange={(e) => setForm({ ...form, vendorId: e.target.value })}>
              <option value="">—</option>
              {s.vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Notes">
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Field>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              s.upsertTask(form);
              setOpen(false);
            }}
          >
            Save
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

function List({
  items,
  onToggle,
  onEdit,
}: {
  items: Task[];
  onToggle: (t: Task) => void;
  onEdit: (t: Task) => void;
}) {
  const s = useApex();
  const sorted = [...items].sort((a, b) => a.dueAt.localeCompare(b.dueAt));
  return (
    <ul className="divide-y divide-line rounded-xl bg-surface hair">
      {sorted.map((t) => {
        const late = t.status !== "done" && t.dueAt <= todayIso();
        return (
          <li key={t.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <button type="button" className="size-11 text-muted" onClick={() => onToggle(t)} aria-label="Toggle done">
              {t.status === "done" ? "✓" : "○"}
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-fg">{t.title}</p>
              <p className="text-xs text-muted">
                {s.clients.find((c) => c.id === t.clientId)?.company ?? "Internal"} · {t.dueAt}
              </p>
            </div>
            <Badge tone={t.priority === "high" ? "loss" : late ? "warn" : "muted"}>{t.priority}</Badge>
            <Button variant="ghost" size="sm" onClick={() => onEdit(t)}>
              Edit
            </Button>
          </li>
        );
      })}
    </ul>
  );
}

function blankTask(): Task {
  return {
    id: uid("tsk"),
    title: "",
    clientId: "",
    vendorId: "",
    dueAt: todayIso(),
    status: "open",
    priority: "normal",
    notes: "",
  };
}
