import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Activity,
  AuditResult,
  Client,
  ClientReport,
  ClientRequest,
  Deal,
  Lead,
  Offer,
  OutreachDraft,
  PipelineStage,
  Proposal,
  QaReview,
  Task,
  TimeEntry,
  Vendor,
} from "./types";
import { PIPELINE_STAGES } from "./types";
import {
  SEED_ACTIVITIES,
  SEED_AUDITS,
  SEED_CLIENTS,
  SEED_DEALS,
  SEED_LEADS,
  SEED_OFFERS,
  SEED_OUTREACH,
  SEED_PROPOSALS,
  SEED_QA,
  SEED_REPORTS,
  SEED_REQUESTS,
  SEED_TASKS,
  SEED_TIME,
  SEED_VENDORS,
} from "./seed";
import { uid } from "./utils";
import {
  clientPnl,
  effortSummary,
  FX_ZAR_SEED,
  HOURS_PER_MONTH_FALLBACK,
  landedVendorCost,
  NO_FEES,
  round1,
  round2,
  scoreLead,
  vendorCostForMonth,
} from "./money";
import type { FeeProfile } from "./money";

/**
 * The operator's data — everything that is theirs rather than the app's. One
 * definition serves both localStorage and the export file, so an export can
 * never quietly drift from what the desk actually saves.
 */
export function persisted(s: ApexState) {
  return {
    fxZar: s.fxZar,
    fxSetAt: s.fxSetAt,
    fees: s.fees,
    workspace: s.workspace,
    leads: s.leads,
    deals: s.deals,
    offers: s.offers,
    vendors: s.vendors,
    clients: s.clients,
    tasks: s.tasks,
    qa: s.qa,
    proposals: s.proposals,
    activities: s.activities,
    requests: s.requests,
    reports: s.reports,
    outreach: s.outreach,
    audits: s.audits,
    timeEntries: s.timeEntries,
    portalClientId: s.portalClientId,
  };
}

export type PersistedState = ReturnType<typeof persisted>;

export const WORKSPACE_FORMAT = "apexline.workspace";
export const WORKSPACE_VERSION = 1;

/** Collections an import must carry before we overwrite the operator's desk. */
const REQUIRED_COLLECTIONS = ["leads", "deals", "offers", "vendors", "clients"] as const;

export interface WorkspaceFile {
  format: typeof WORKSPACE_FORMAT;
  version: typeof WORKSPACE_VERSION;
  exportedAt: string;
  state: PersistedState;
}

function clampFeeInput(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.min(50, Math.max(0, round2(n)));
}

export interface ApexState {
  hydrated: boolean;
  fxZar: number;
  /** ISO date the operator last set fxZar. A stale rate should look stale. */
  fxSetAt: string;
  /** Marketplace and payment fees this desk actually pays. */
  fees: FeeProfile;
  workspace: string;
  leads: Lead[];
  deals: Deal[];
  offers: Offer[];
  vendors: Vendor[];
  clients: Client[];
  tasks: Task[];
  qa: QaReview[];
  proposals: Proposal[];
  activities: Activity[];
  requests: ClientRequest[];
  reports: ClientReport[];
  outreach: OutreachDraft[];
  audits: AuditResult[];
  timeEntries: TimeEntry[];
  portalClientId: string;

  setHydrated: (v: boolean) => void;
  resetDemo: () => void;
  log: (kind: string, refId: string, text: string) => void;

  upsertLead: (lead: Lead) => void;
  importLeads: (leads: Lead[]) => number;
  setLeadStatus: (id: string, status: PipelineStage) => void;
  deleteLead: (id: string) => void;

  upsertDeal: (deal: Deal) => void;
  moveDeal: (id: string, stage: PipelineStage) => void;

  upsertOffer: (offer: Offer) => void;
  upsertVendor: (vendor: Vendor) => void;
  upsertClient: (client: Client) => void;
  upsertTask: (task: Task) => void;
  upsertQa: (qa: QaReview) => void;
  upsertProposal: (p: Proposal) => void;
  addOutreach: (d: OutreachDraft) => void;
  addAudit: (a: AuditResult) => void;
  addRequest: (r: ClientRequest) => void;
  resolveRequest: (id: string) => void;
  addReport: (r: ClientReport) => void;
  setPortalClient: (id: string) => void;
  setFx: (rate: number) => void;
  setFees: (fees: FeeProfile) => void;
  logTime: (entry: TimeEntry) => void;
  deleteTimeEntry: (id: string) => void;
  exportWorkspace: () => string;
  importWorkspace: (json: string) => { ok: true } | { ok: false; error: string };
}

function demo(): Omit<
  ApexState,
  | "hydrated"
  | "setHydrated"
  | "resetDemo"
  | "log"
  | "upsertLead"
  | "importLeads"
  | "setLeadStatus"
  | "deleteLead"
  | "upsertDeal"
  | "moveDeal"
  | "upsertOffer"
  | "upsertVendor"
  | "upsertClient"
  | "upsertTask"
  | "upsertQa"
  | "upsertProposal"
  | "addOutreach"
  | "addAudit"
  | "addRequest"
  | "resolveRequest"
  | "addReport"
  | "setPortalClient"
  | "logTime"
  | "deleteTimeEntry"
  | "setFx"
  | "setFees"
  | "exportWorkspace"
  | "importWorkspace"
> {
  return {
    fxZar: FX_ZAR_SEED,
    fxSetAt: todayIso(),
    fees: NO_FEES,
    workspace: "Apexline",
    leads: SEED_LEADS,
    deals: SEED_DEALS,
    offers: SEED_OFFERS,
    vendors: SEED_VENDORS,
    clients: SEED_CLIENTS,
    tasks: SEED_TASKS,
    qa: SEED_QA,
    proposals: SEED_PROPOSALS,
    activities: SEED_ACTIVITIES,
    requests: SEED_REQUESTS,
    reports: SEED_REPORTS,
    outreach: SEED_OUTREACH,
    audits: SEED_AUDITS,
    timeEntries: SEED_TIME,
    portalClientId: "cli-01",
  };
}

export const useApex = create<ApexState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      ...demo(),
      setHydrated: (v) => set({ hydrated: v }),
      resetDemo: () => set({ ...demo() }),
      log: (kind, refId, text) =>
        set({
          activities: [
            { id: uid("act"), at: new Date().toISOString(), kind, refId, text },
            ...get().activities,
          ].slice(0, 80),
        }),
      upsertLead: (lead) =>
        set({
          leads: get().leads.some((l) => l.id === lead.id)
            ? get().leads.map((l) => (l.id === lead.id ? lead : l))
            : [lead, ...get().leads],
        }),
      importLeads: (incoming) => {
        const existing = new Set(get().leads.map((l) => l.email.toLowerCase() + "|" + l.company.toLowerCase()));
        const add = incoming.filter((l) => !existing.has(l.email.toLowerCase() + "|" + l.company.toLowerCase()));
        if (add.length) set({ leads: [...add, ...get().leads] });
        return add.length;
      },
      setLeadStatus: (id, status) => {
        set({ leads: get().leads.map((l) => (l.id === id ? { ...l, status } : l)) });
        const deal = get().deals.find((d) => d.leadId === id);
        if (deal) get().moveDeal(deal.id, status);
      },
      deleteLead: (id) => set({ leads: get().leads.filter((l) => l.id !== id) }),
      upsertDeal: (deal) =>
        set({
          deals: get().deals.some((d) => d.id === deal.id)
            ? get().deals.map((d) => (d.id === deal.id ? deal : d))
            : [deal, ...get().deals],
        }),
      moveDeal: (id, stage) => {
        const deal = get().deals.find((d) => d.id === id);
        if (!deal) return;
        set({
          deals: get().deals.map((d) => (d.id === id ? { ...d, stage, probability: stageProb(stage) } : d)),
          leads: get().leads.map((l) => (l.id === deal.leadId ? { ...l, status: stage } : l)),
        });
        if (stage === "won") {
          const lead = get().leads.find((l) => l.id === deal.leadId);
          if (lead && !get().clients.some((c) => c.email === lead.email)) {
            const offer = get().offers[0];
            const vendor = get().vendors.find((v) => v.availability !== "booked") ?? get().vendors[0];
            const client: Client = {
              id: uid("cli"),
              company: lead.company,
              country: lead.country,
              industry: lead.industry,
              contactName: lead.contactName,
              email: lead.email,
              offerId: offer?.id ?? "",
              // Inherit the hours the offer was priced for, so the new client
              // has something real to measure logged effort against.
              quotedHoursPerMonth: offer?.quotedHoursPerMonth ?? HOURS_PER_MONTH_FALLBACK,
              monthlyFeeUsd: deal.valueUsd,
              vendorId: vendor?.id ?? "",
              sla: "standard",
              startDate: new Date().toISOString().slice(0, 10),
              status: "onboarding",
              csat: 0,
              notes: "Created from won deal. Confirm vendor and SLA.",
              toolCostUsd: 40,
              otherCostUsd: 0,
              invoiceStatus: "unpaid_setup",
            };
            set({
              clients: [client, ...get().clients],
              tasks: [
                {
                  id: uid("tsk"),
                  title: `Onboard ${lead.company} — collect setup`,
                  clientId: client.id,
                  vendorId: vendor?.id ?? "",
                  dueAt: new Date().toISOString().slice(0, 10),
                  status: "open",
                  priority: "high",
                  notes: "No vendor work until setup + month 1 clear.",
                },
                ...get().tasks,
              ],
            });
            get().log("client", client.id, `Won ${lead.company}. Client created. Setup unpaid — do not start work.`);
          }
        }
        get().log("deal", id, `Moved to ${stage.replaceAll("_", " ")}`);
      },
      upsertOffer: (offer) =>
        set({
          offers: get().offers.some((o) => o.id === offer.id)
            ? get().offers.map((o) => (o.id === offer.id ? offer : o))
            : [offer, ...get().offers],
        }),
      upsertVendor: (vendor) =>
        set({
          vendors: get().vendors.some((v) => v.id === vendor.id)
            ? get().vendors.map((v) => (v.id === vendor.id ? vendor : v))
            : [vendor, ...get().vendors],
        }),
      upsertClient: (client) =>
        set({
          clients: get().clients.some((c) => c.id === client.id)
            ? get().clients.map((c) => (c.id === client.id ? client : c))
            : [client, ...get().clients],
        }),
      upsertTask: (task) =>
        set({
          tasks: get().tasks.some((t) => t.id === task.id)
            ? get().tasks.map((t) => (t.id === task.id ? task : t))
            : [task, ...get().tasks],
        }),
      upsertQa: (qa) => set({ qa: [qa, ...get().qa.filter((x) => x.id !== qa.id)] }),
      upsertProposal: (p) =>
        set({
          proposals: get().proposals.some((x) => x.id === p.id)
            ? get().proposals.map((x) => (x.id === p.id ? p : x))
            : [p, ...get().proposals],
        }),
      addOutreach: (d) => set({ outreach: [d, ...get().outreach] }),
      addAudit: (a) => set({ audits: [a, ...get().audits] }),
      addRequest: (r) => set({ requests: [r, ...get().requests] }),
      resolveRequest: (id) =>
        set({ requests: get().requests.map((r) => (r.id === id ? { ...r, status: "done" } : r)) }),
      addReport: (r) => set({ reports: [r, ...get().reports] }),
      setPortalClient: (id) => set({ portalClientId: id }),
      logTime: (entry) =>
        set({
          timeEntries: [
            { ...entry, hours: Math.max(0, round1(entry.hours)) },
            ...get().timeEntries.filter((t) => t.id !== entry.id),
          ],
        }),
      deleteTimeEntry: (id) => set({ timeEntries: get().timeEntries.filter((t) => t.id !== id) }),
      setFx: (rate) => {
        if (!Number.isFinite(rate) || rate <= 0) return;
        set({ fxZar: round2(rate), fxSetAt: todayIso() });
      },
      setFees: (fees) =>
        set({
          fees: {
            channel: fees.channel,
            vendorFeePct: clampFeeInput(fees.vendorFeePct),
            paymentFeePct: clampFeeInput(fees.paymentFeePct),
          },
        }),
      exportWorkspace: () => {
        const s = get();
        const payload: WorkspaceFile = {
          format: WORKSPACE_FORMAT,
          version: WORKSPACE_VERSION,
          exportedAt: new Date().toISOString(),
          state: persisted(s),
        };
        return JSON.stringify(payload, null, 2);
      },
      importWorkspace: (json) => {
        let parsed: unknown;
        try {
          parsed = JSON.parse(json);
        } catch {
          return { ok: false, error: "That file is not valid JSON." };
        }
        const file = parsed as Partial<WorkspaceFile>;
        if (file?.format !== WORKSPACE_FORMAT) {
          return { ok: false, error: "That is not an Apexline workspace file." };
        }
        if (file.version !== WORKSPACE_VERSION) {
          return {
            ok: false,
            error: `That file is version ${String(file.version)}; this desk reads version ${WORKSPACE_VERSION}.`,
          };
        }
        if (!file.state || typeof file.state !== "object") {
          return { ok: false, error: "That file has no workspace in it." };
        }
        for (const key of REQUIRED_COLLECTIONS) {
          if (!Array.isArray((file.state as Record<string, unknown>)[key])) {
            return { ok: false, error: `That file is missing its ${key}.` };
          }
        }
        // Merge onto the seed so a file written by an older desk still loads:
        // anything it does not carry keeps the seeded default.
        set({ ...demo(), ...file.state });
        return { ok: true };
      },
    }),
    {
      name: "apexline-os-v1",
      // The server renders the seeded workspace; the browser holds the
      // operator's real data. Rehydrating during module load would make the
      // first client render disagree with the server HTML, so we wait for
      // `useStoreHydration` to call rehydrate() after React has hydrated.
      skipHydration: true,
      onRehydrateStorage: () => (state) => state?.setHydrated(true),
      partialize: persisted,
    },
  ),
);

function stageProb(stage: PipelineStage) {
  const i = PIPELINE_STAGES.indexOf(stage);
  if (stage === "won") return 100;
  if (stage === "lost") return 0;
  return Math.round((i / (PIPELINE_STAGES.length - 2)) * 80);
}

/** Current calendar month, yyyy-mm, in UTC so the server and browser agree. */
export function currentMonth() {
  return todayIso().slice(0, 7);
}

/**
 * Hours logged against a client this month, measured against the hours its
 * price assumed. This is the difference between margin you assumed and margin
 * you earned.
 */
export function clientEffort(s: ApexState, clientId: string, month = currentMonth()) {
  const client = s.clients.find((c) => c.id === clientId);
  const logged = s.timeEntries
    .filter((t) => t.clientId === clientId && t.date.startsWith(month))
    .reduce((a, t) => a + t.hours, 0);
  return effortSummary(client?.quotedHoursPerMonth ?? HOURS_PER_MONTH_FALLBACK, logged);
}

/**
 * What this client's vendor costs this month. Hourly vendors are costed on the
 * hours actually logged; with nothing logged we fall back to the quote and the
 * figure is flagged unmeasured rather than presented as fact.
 */
export function clientVendorCost(s: ApexState, c: Client, month = currentMonth()) {
  const vendor = s.vendors.find((v) => v.id === c.vendorId);
  const effort = clientEffort(s, c.id, month);
  return vendorCostForMonth(vendor, effort.unmeasured ? effort.quotedHours : effort.loggedHours);
}

export function vendorMonthly(v: Vendor | undefined, hours = HOURS_PER_MONTH_FALLBACK) {
  return vendorCostForMonth(v, hours);
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function kpis(s: ApexState) {
  const active = s.clients.filter((c) => c.status === "active" || c.status === "at_risk" || c.status === "onboarding");
  const mrr = active.reduce((a, c) => a + c.monthlyFeeUsd, 0);
  // Fees are part of the cost base, not a footnote: marketplace fees raise what
  // the vendor costs, payment fees come out of what the client pays.
  const vendor = active.reduce(
    (a, c) => a + landedVendorCost(clientVendorCost(s, c), s.fees.vendorFeePct),
    0,
  );
  const paymentFees = active.reduce(
    (a, c) => a + c.monthlyFeeUsd * (s.fees.paymentFeePct / 100),
    0,
  );
  const tools = active.reduce((a, c) => a + c.toolCostUsd + c.otherCostUsd, 0) + paymentFees;
  const gp = mrr - vendor - tools;
  const margin = mrr ? (gp / mrr) * 100 : 0;
  const openDeals = s.deals.filter((d) => d.stage !== "won" && d.stage !== "lost");
  const pipeline = openDeals.reduce((a, d) => a + d.valueUsd * (d.probability / 100), 0);
  const dueToday = s.tasks.filter((t) => t.status !== "done" && t.dueAt <= todayIso());
  const hot = [...s.leads].filter((l) => l.status !== "won" && l.status !== "lost").sort((a, b) => b.score - a.score);
  const atRisk = s.clients.filter((c) => c.status === "at_risk" || c.invoiceStatus !== "current" || c.csat < 4);
  const thin = active
    .map((c) => ({ c, pnl: clientPnl(c, clientVendorCost(s, c), s.fees) }))
    .filter((x) => x.pnl.margin < 40);
  // Clients being worked past the hours they were priced for. On an hourly
  // vendor this is margin leaking now; on a monthly vendor it is the renewal
  // and quality risk that shows up later.
  const overrunning = active
    .map((c) => ({ c, effort: clientEffort(s, c.id) }))
    .filter((x) => x.effort.overrun);
  return {
    active, mrr, vendor, tools, paymentFees, gp, margin, openDeals, pipeline, dueToday, hot, atRisk,
    thin, overrunning,
  };
}

export function blankLead(): Lead {
  return {
    id: uid("lead"),
    company: "",
    website: "",
    country: "",
    industry: "",
    contactName: "",
    contactTitle: "",
    email: "",
    linkedin: "",
    phone: "",
    source: "Manual",
    status: "new_lead",
    score: 20,
    notes: "",
    painPoints: [],
    suggestedOffer: "",
    hiringSignal: false,
    outsourcingIntent: false,
    employees: "11-50",
    createdAt: todayIso(),
    nextAction: "Research and audit",
    nextActionAt: todayIso(),
  };
}

export { scoreLead };
