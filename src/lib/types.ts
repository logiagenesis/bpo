export const PIPELINE_STAGES = [
  "new_lead",
  "researched",
  "contacted",
  "replied",
  "call_booked",
  "proposal_sent",
  "negotiation",
  "won",
  "lost",
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export const STAGE_LABEL: Record<PipelineStage, string> = {
  new_lead: "New",
  researched: "Researched",
  contacted: "Contacted",
  replied: "Replied",
  call_booked: "Call booked",
  proposal_sent: "Proposal",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
};

export const SERVICES = [
  "appointment_setting",
  "inbound_support",
  "lead_generation",
  "admin_va",
  "bookkeeping",
  "social_media",
  "data_entry",
  "recruitment",
  "web_fulfilment",
  "chat_email_support",
] as const;

export type ServiceType = (typeof SERVICES)[number];

export const SERVICE_LABEL: Record<ServiceType, string> = {
  appointment_setting: "Appointment setting",
  inbound_support: "Inbound support",
  lead_generation: "Lead generation",
  admin_va: "Admin / VA",
  bookkeeping: "Bookkeeping",
  social_media: "Social media ops",
  data_entry: "Data entry",
  recruitment: "Recruitment screening",
  web_fulfilment: "Web / app fulfilment",
  chat_email_support: "Chat & email support",
};

export const TONES = [
  "direct",
  "premium",
  "friendly",
  "enterprise",
  "short_aggressive",
  "conservative",
] as const;
export type Tone = (typeof TONES)[number];

export const TONE_LABEL: Record<Tone, string> = {
  direct: "Direct",
  premium: "Premium",
  friendly: "Friendly",
  enterprise: "Enterprise",
  short_aggressive: "Short / aggressive",
  conservative: "Conservative",
};

export const SLA_LEVELS = ["standard", "priority", "white_glove"] as const;
export type SlaLevel = (typeof SLA_LEVELS)[number];

export type LeadStatus = PipelineStage | "nurture";

export interface Lead {
  id: string;
  company: string;
  website: string;
  country: string;
  industry: string;
  contactName: string;
  contactTitle: string;
  email: string;
  linkedin: string;
  phone: string;
  source: string;
  status: PipelineStage;
  score: number;
  notes: string;
  painPoints: string[];
  suggestedOffer: string;
  hiringSignal: boolean;
  outsourcingIntent: boolean;
  employees: string;
  createdAt: string;
  nextAction: string;
  nextActionAt: string;
}

export interface Deal {
  id: string;
  leadId: string;
  title: string;
  stage: PipelineStage;
  valueUsd: number;
  probability: number;
  expectedClose: string;
  nextAction: string;
  owner: string;
  notes: string;
  lostReason: string;
  createdAt: string;
}

export interface Offer {
  id: string;
  name: string;
  service: ServiceType;
  industry: string;
  deliverables: string;
  workload: string;
  vendorCostUsd: number;
  desiredMarginPct: number;
  sla: SlaLevel;
  timeline: string;
  priceUsd: number;
  upsells: string;
  riskWarnings: string;
  copy: string;
  createdAt: string;
}

export interface Proposal {
  id: string;
  leadId: string;
  offerId: string;
  title: string;
  problem: string;
  solution: string;
  deliverables: string;
  timeline: string;
  pricing: string;
  sla: string;
  reporting: string;
  terms: string;
  nextSteps: string;
  status: "draft" | "sent" | "accepted" | "declined";
  createdAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  email: string;
  country: string;
  timezone: string;
  skills: string[];
  rateUsd: number;
  rateType: "hourly" | "monthly";
  availability: "available" | "limited" | "booked";
  rating: number;
  testTask: string;
  notes: string;
  nda: boolean;
  performance: number;
  assignedClientIds: string[];
}

export interface Client {
  id: string;
  company: string;
  country: string;
  industry: string;
  contactName: string;
  email: string;
  offerId: string;
  monthlyFeeUsd: number;
  vendorId: string;
  sla: SlaLevel;
  startDate: string;
  status: "onboarding" | "active" | "at_risk" | "paused" | "churned";
  csat: number;
  notes: string;
  toolCostUsd: number;
  otherCostUsd: number;
  invoiceStatus: "current" | "overdue" | "unpaid_setup";
}

export interface Task {
  id: string;
  title: string;
  clientId: string;
  vendorId: string;
  dueAt: string;
  status: "open" | "in_progress" | "done" | "blocked";
  priority: "low" | "normal" | "high";
  notes: string;
}

export interface QaReview {
  id: string;
  kind: "calls" | "tickets" | "leads" | "admin" | "creative" | "data_entry" | "appointments";
  clientId: string;
  vendorId: string;
  score: number;
  mistakes: string;
  coaching: string;
  clientImpact: string;
  followUp: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  at: string;
  kind: string;
  refId: string;
  text: string;
}

export interface ClientRequest {
  id: string;
  clientId: string;
  at: string;
  title: string;
  body: string;
  status: "open" | "done";
}

export interface ClientReport {
  id: string;
  clientId: string;
  period: string;
  summary: string;
  kpis: { label: string; value: string }[];
}

export interface OutreachDraft {
  id: string;
  leadId: string;
  tone: Tone;
  channel: "email" | "linkedin" | "call" | "whatsapp" | "job_board";
  subject: string;
  body: string;
  createdAt: string;
}

export interface AuditResult {
  id: string;
  leadId: string;
  url: string;
  business: string;
  bottlenecks: string[];
  opportunities: string[];
  package: string;
  monthlyValueUsd: number;
  angle: string;
  emailDraft: string;
  linkedinDraft: string;
  callOpener: string;
  proposalSummary: string;
  createdAt: string;
}

export interface Niche {
  id: ServiceType;
  demand: "low" | "medium" | "high";
  difficulty: "low" | "medium" | "high";
  typicalClientUsd: number;
  typicalVendorUsd: number;
  skills: string;
  pitch: string;
}

export const SLA_MULTIPLIER: Record<SlaLevel, number> = {
  standard: 1,
  priority: 1.2,
  white_glove: 1.45,
};
