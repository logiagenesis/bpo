import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Stat } from "@/components/stat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { channelFee, clientPnl, SOURCING_CHANNELS, usd, zar } from "@/lib/money";
import type { SourcingChannel } from "@/lib/money";
import { clientEffort, clientVendorCost, kpis, todayIso, useApex } from "@/lib/store";

export const Route = createFileRoute("/profit")({ component: ProfitPage });

function ProfitPage() {
  const s = useApex();
  const { mrr, gp, margin, vendor, tools, pipeline } = kpis(s);
  const fileInput = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState<{ tone: "gain" | "loss"; text: string } | null>(null);
  const rows = s.clients.map((c) => {
    const v = s.vendors.find((x) => x.id === c.vendorId);
    return { c, v, pnl: clientPnl(c, clientVendorCost(s, c), s.fees), effort: clientEffort(s, c.id) };
  });

  return (
    <div>
      <PageHeader
        kicker="Money"
        title="Profit desk"
      >
        If a row does not move margin, keep, cost, or risk — it is a hobby.
      </PageHeader>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="MRR" value={usd(mrr)} hint={zar(mrr, s.fxZar)} />
        <Stat label="Vendor cost" value={usd(vendor)} />
        <Stat label="Tools / other" value={usd(tools)} />
        <Stat label="Gross profit" value={usd(gp)} hint={`${margin.toFixed(1)}% · pipeline ${usd(pipeline)}`} tone="gain" />
      </div>
      <section className="mt-8 grid gap-4 rounded-xl bg-surface p-4 hair lg:grid-cols-3">
        <div>
          <h2 className="mb-3 font-display text-lg">Exchange rate</h2>
          <Field label={`ZAR per USD — set ${fxAge(s.fxSetAt)}`}>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              value={s.fxZar}
              onChange={(e) => s.setFx(Number(e.target.value))}
            />
          </Field>
          <p className="mt-2 text-xs text-muted">
            Every rand figure on the desk uses this. {isStale(s.fxSetAt) ? (
              <span className="text-warn">It is over a week old — check it.</span>
            ) : (
              "Update it when the rate moves."
            )}
          </p>
        </div>

        <div>
          <h2 className="mb-3 font-display text-lg">Fee drag</h2>
          <Field label="Vendor sourced through">
            <Select
              value={s.fees.channel}
              onChange={(e) => {
                const channel = e.target.value as SourcingChannel;
                s.setFees({ ...s.fees, channel, vendorFeePct: channelFee(channel) });
              }}
            >
              {SOURCING_CHANNELS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label} — {c.vendorFeePct}%
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Payment processing %" className="mt-3">
            <Input
              type="number"
              step="0.1"
              min="0"
              max="50"
              value={s.fees.paymentFeePct}
              onChange={(e) => s.setFees({ ...s.fees, paymentFeePct: Number(e.target.value) })}
            />
          </Field>
          <p className="mt-2 text-xs text-muted">
            Fees are part of the cost base. Quoting against a raw vendor rate overstates margin.
          </p>
        </div>

        <div>
          <h2 className="mb-3 font-display text-lg">Your data</h2>
          <p className="text-xs text-muted">
            This desk lives in one browser. Clear the cache and it is gone. Export before you
            switch machines.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => downloadWorkspace(s.exportWorkspace(), s.workspace)}>
              Export workspace
            </Button>
            <Button size="sm" variant="outline" onClick={() => fileInput.current?.click()}>
              Import
            </Button>
            <Button size="sm" variant="danger" onClick={() => s.resetDemo()}>
              Reset demo
            </Button>
          </div>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              const res = s.importWorkspace(await file.text());
              setNotice(
                res.ok
                  ? { tone: "gain", text: "Workspace imported." }
                  : { tone: "loss", text: res.error },
              );
            }}
          />
          {notice ? (
            <p className={`mt-3 text-xs ${notice.tone === "gain" ? "text-gain" : "text-loss"}`}>
              {notice.text}
            </p>
          ) : null}
        </div>
      </section>

      <div className="mt-8 overflow-x-auto rounded-xl bg-surface hair">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.12em] text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Client</th>
              <th className="px-4 py-3 font-medium">Revenue</th>
              <th className="px-4 py-3 font-medium">Vendor</th>
              <th className="px-4 py-3 font-medium">Tools</th>
              <th className="px-4 py-3 font-medium">GP</th>
              <th className="px-4 py-3 font-medium">Margin</th>
              <th className="px-4 py-3 font-medium">Flags</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ c, v, pnl, effort }) => (
              <tr key={c.id} className="border-t border-line">
                <td className="px-4 py-3">
                  <Link to="/clients/$clientId" params={{ clientId: c.id }} className="hover:text-accent">
                    {c.company}
                  </Link>
                  <div className="text-xs text-muted">{v?.name}</div>
                </td>
                <td className="px-4 py-3 tabular">{usd(c.monthlyFeeUsd)}</td>
                <td className="px-4 py-3 tabular">{usd(pnl.vendor)}</td>
                <td className="px-4 py-3 tabular">{usd(c.toolCostUsd + c.otherCostUsd)}</td>
                <td className="px-4 py-3 tabular text-gain">{usd(pnl.gp)}</td>
                <td className={`px-4 py-3 tabular ${pnl.tone === "gain" ? "text-gain" : pnl.tone === "warn" ? "text-warn" : "text-loss"}`}>
                  {pnl.margin.toFixed(0)}%
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {c.invoiceStatus !== "current" ? <Badge tone="loss">{c.invoiceStatus.replace("_", " ")}</Badge> : null}
                    {c.status === "at_risk" ? <Badge tone="warn">at risk</Badge> : null}
                    {c.csat > 0 && c.csat < 4 ? <Badge tone="warn">CSAT</Badge> : null}
                    {pnl.margin < 40 ? <Badge tone="loss">thin</Badge> : null}
                    {effort.overrun ? <Badge tone="loss">+{effort.overrunHours}h</Badge> : null}
                    {effort.unmeasured ? <Badge tone="warn">no hours</Badge> : null}
                    {(v?.performance ?? 100) < 80 ? <Badge tone="warn">vendor</Badge> : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function fxAge(setAt: string) {
  const days = daysSince(setAt);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

function isStale(setAt: string) {
  return daysSince(setAt) > 7;
}

function daysSince(iso: string) {
  const then = Date.parse(`${iso}T00:00:00Z`);
  const now = Date.parse(`${todayIso()}T00:00:00Z`);
  if (Number.isNaN(then) || Number.isNaN(now)) return 0;
  return Math.max(0, Math.round((now - then) / 86_400_000));
}

function downloadWorkspace(json: string, workspace: string) {
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${workspace.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${todayIso()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
