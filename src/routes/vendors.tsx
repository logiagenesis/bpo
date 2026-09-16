import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { usd } from "@/lib/money";
import { useApex } from "@/lib/store";
import type { Vendor } from "@/lib/types";
import { uid } from "@/lib/utils";

export const Route = createFileRoute("/vendors")({ component: VendorsPage });

function VendorsPage() {
  const s = useApex();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Vendor>(blankVendor());

  return (
    <div>
      <PageHeader
        kicker="Run"
        title="Vendors"
        action={
          <Button
            onClick={() => {
              setForm(blankVendor());
              setOpen(true);
            }}
          >
            Add vendor
          </Button>
        }
      >
        Test task, NDA, backup named. No client contact unless you approve the channel.
      </PageHeader>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {s.vendors.map((v) => (
          <article key={v.id} className="rounded-xl bg-surface p-5 hair">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="font-display text-xl">{v.name}</h2>
                <p className="text-xs text-muted">
                  {v.country} · {v.timezone}
                </p>
              </div>
              <Badge tone={v.availability === "available" ? "gain" : v.availability === "limited" ? "warn" : "muted"}>
                {v.availability}
              </Badge>
            </div>
            <p className="mt-3 text-sm">{v.skills.join(" · ")}</p>
            <p className="mt-2 tabular text-sm">
              {usd(v.rateUsd)} / {v.rateType} · QA {v.performance}
            </p>
            <p className="mt-2 text-xs text-muted">
              NDA {v.nda ? "on file" : "missing"} · test {v.testTask}
            </p>
            <p className="mt-2 text-sm text-muted">{v.notes}</p>
            <div className="mt-3 flex flex-wrap gap-1">
              {v.assignedClientIds.map((id) => {
                const c = s.clients.find((x) => x.id === id);
                return c ? (
                  <Badge key={id} tone="info">
                    {c.company}
                  </Badge>
                ) : null;
              })}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-3"
              onClick={() => {
                setForm(v);
                setOpen(true);
              }}
            >
              Edit
            </Button>
          </article>
        ))}
      </div>
      <Dialog open={open} onClose={() => setOpen(false)} title={form.name || "Vendor"} wide>
        <VendorForm form={form} setForm={setForm} />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              s.upsertVendor(form);
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

function VendorForm({ form, setForm }: { form: Vendor; setForm: (v: Vendor) => void }) {
  const set = (k: keyof Vendor, v: unknown) => setForm({ ...form, [k]: v });
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label="Name">
        <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
      </Field>
      <Field label="Email">
        <Input value={form.email} onChange={(e) => set("email", e.target.value)} />
      </Field>
      <Field label="Country">
        <Input value={form.country} onChange={(e) => set("country", e.target.value)} />
      </Field>
      <Field label="Timezone">
        <Input value={form.timezone} onChange={(e) => set("timezone", e.target.value)} />
      </Field>
      <Field label="Rate USD">
        <Input type="number" value={form.rateUsd} onChange={(e) => set("rateUsd", Number(e.target.value))} />
      </Field>
      <Field label="Rate type">
        <Select value={form.rateType} onChange={(e) => set("rateType", e.target.value)}>
          <option value="monthly">monthly</option>
          <option value="hourly">hourly</option>
        </Select>
      </Field>
      <Field label="Availability">
        <Select value={form.availability} onChange={(e) => set("availability", e.target.value)}>
          <option>available</option>
          <option>limited</option>
          <option>booked</option>
        </Select>
      </Field>
      <Field label="Performance">
        <Input type="number" value={form.performance} onChange={(e) => set("performance", Number(e.target.value))} />
      </Field>
      <Field label="Skills (comma)" className="sm:col-span-2">
        <Input value={form.skills.join(", ")} onChange={(e) => set("skills", e.target.value.split(",").map((x) => x.trim()).filter(Boolean))} />
      </Field>
      <Field label="Test task" className="sm:col-span-2">
        <Input value={form.testTask} onChange={(e) => set("testTask", e.target.value)} />
      </Field>
      <Field label="Notes" className="sm:col-span-2">
        <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} />
      </Field>
      <label className="flex h-11 items-center gap-2 text-sm">
        <input type="checkbox" checked={form.nda} onChange={(e) => set("nda", e.target.checked)} />
        NDA on file
      </label>
    </div>
  );
}

function blankVendor(): Vendor {
  return {
    id: uid("ven"),
    name: "",
    email: "",
    country: "",
    timezone: "SAST",
    skills: [],
    rateUsd: 1200,
    rateType: "monthly",
    availability: "available",
    rating: 0,
    testTask: "",
    notes: "",
    nda: false,
    performance: 0,
    assignedClientIds: [],
  };
}
