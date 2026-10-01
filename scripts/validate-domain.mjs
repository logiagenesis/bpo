import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import ts from 'typescript';

// Compile domain modules in an ignored directory; no browser or API required.
await mkdir('.validation', { recursive: true });
for (const name of ['types', 'money', 'seed', 'utils', 'store']) {
  const source = await readFile('src/lib/' + name + '.ts', 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 }
  }).outputText.replace(/from ["']\.\/([^"']+)["']/g, 'from "./$1.mjs"');
  await writeFile('.validation/' + name + '.mjs', compiled);
}
const saved = new Map();
globalThis.localStorage = {
  getItem: key => saved.get(key) ?? null,
  setItem: (key, value) => saved.set(key, value),
  removeItem: key => saved.delete(key),
};
globalThis.window = { localStorage: globalThis.localStorage };
const money = await import('../.validation/money.mjs');
const store = await import('../.validation/store.mjs');
const s = store.useApex.getState();
const cash = money.cashSummary(s.invoices, '2026-10-01');
assert.equal(cash.invoiced, 42500);
assert.equal(cash.collected, 29900);
assert.equal(cash.outstanding, 12600);
assert.equal(cash.overdue, 12600);
assert.equal(store.clientEffort(s, 'cli-02', '2026-09').loggedHours, 369);
assert.equal(store.clientEffort(s, 'cli-03', '2026-09').overrunHours, 12);
const oak = s.clients.find(c => c.id === 'cli-03');
assert.equal(store.clientVendorCost(s, oak, '2026-09'), 1568);
assert.equal(store.setupSettled(s, 'cli-01'), true);
assert.equal(store.setupSettled(s, 'cli-04'), false);
assert.equal(money.priceFromCost(1500, 50), 3000);
const fees = { channel: 'other', vendorFeePct: 10, paymentFeePct: 3 };
const price = money.priceFromCost(1500, 50, 'standard', fees);
const landed = money.landedVendorCost(1500, 10);
assert.ok(Math.abs((price - landed - price * .03) / price - .5) < .00001);
assert.throws(() => money.priceFromCost(1500, 85, 'standard', { ...fees, paymentFeePct: 20 }));
const baseline = store.kpis(s);
store.useApex.getState().setFees({ channel: 'upwork_business', vendorFeePct: 10, paymentFeePct: 0 });
const afterFees = store.kpis(store.useApex.getState());
assert.ok(afterFees.gp < baseline.gp);
const exported = store.useApex.getState().exportWorkspace();
assert.equal(JSON.parse(exported).format, 'apexline.workspace');
store.useApex.getState().setFx(20);
assert.equal(store.useApex.getState().importWorkspace(exported).ok, true);
assert.equal(store.useApex.getState().fxZar, JSON.parse(exported).state.fxZar);
assert.equal(store.useApex.getState().importWorkspace('{bad json').ok, false);
assert.equal(store.useApex.getState().importWorkspace(JSON.stringify({ format: 'wrong' })).ok, false);
assert.equal(store.useApex.getState().importWorkspace(JSON.stringify({ format: 'apexline.workspace', version: 99 })).ok, false);
const invoice = store.useApex.getState().invoices.find(i => !i.paidAt);
store.useApex.getState().markInvoicePaid(invoice.id, '2026-10-01');
const paid = money.cashSummary(store.useApex.getState().invoices, '2026-10-01');
assert.equal(paid.collected, cash.collected + invoice.amountUsd);
assert.equal(paid.outstanding, cash.outstanding - invoice.amountUsd);
console.log(JSON.stringify({
  status: 'PASS',
  checks: 'cash totals and payment movement; effort and actual hourly cost; setup predicate; fee-aware quote target; fee drag; export/import and invalid-file rejection',
  cash,
  september: { heliosHours: 369, oakOverrunHours: 12, oakVendorCost: 1568 },
  quote: { vendor: 1500, vendorFeePct: 10, paymentFeePct: 3, targetMarginPct: 50, price },
  baseline: { mrr: baseline.mrr, gp: baseline.gp, margin: baseline.margin },
  afterVendorFees: { gp: afterFees.gp, margin: afterFees.margin }
}, null, 2));

