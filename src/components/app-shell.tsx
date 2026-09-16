import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BookOpen,
  Briefcase,
  Building2,
  ClipboardCheck,
  Compass,
  LayoutDashboard,
  LineChart,
  ListChecks,
  Menu,
  MessageSquare,
  ScanSearch,
  Send,
  Shield,
  Sparkles,
  Timer,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { ApexMark } from "./mark";
import { cn } from "@/lib/utils";
import { kpis, useApex } from "@/lib/store";
import { useStoreHydration } from "@/lib/use-store-hydration";
import { usd } from "@/lib/money";

const NAV = [
  {
    label: "Money",
    items: [
      { to: "/", label: "Command", icon: LayoutDashboard },
      { to: "/profit", label: "Profit", icon: Wallet },
      { to: "/offers", label: "Offers", icon: Briefcase },
    ],
  },
  {
    label: "Win",
    items: [
      { to: "/leads", label: "Leads", icon: Users },
      { to: "/audit", label: "Audit", icon: ScanSearch },
      { to: "/pipeline", label: "Pipeline", icon: LineChart },
      { to: "/outreach", label: "Outreach", icon: Send },
      { to: "/proposals", label: "Proposals", icon: MessageSquare },
    ],
  },
  {
    label: "Run",
    items: [
      { to: "/clients", label: "Clients", icon: Building2 },
      { to: "/vendors", label: "Vendors", icon: Shield },
      { to: "/tasks", label: "Tasks", icon: ListChecks },
      { to: "/effort", label: "Effort", icon: Timer },
      { to: "/qa", label: "QA", icon: ClipboardCheck },
      { to: "/portal", label: "Client portal", icon: Compass },
    ],
  },
  {
    label: "Library",
    items: [
      { to: "/services", label: "Niches", icon: Compass },
      { to: "/templates", label: "Bibles", icon: BookOpen },
      { to: "/assistant", label: "Assistant", icon: Sparkles },
    ],
  },
];

function NavBody({ onGo }: { onGo?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-6 px-3 pb-8">
      {NAV.map((g) => (
        <div key={g.label}>
          <p className="px-3 pb-2 text-[11px] uppercase tracking-[0.18em] text-faint">{g.label}</p>
          <ul className="flex flex-col gap-0.5">
            {g.items.map((item) => {
              const active = item.to === "/" ? pathname === "/" : pathname === item.to || pathname.startsWith(item.to + "/");
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={onGo}
                    className={cn(
                      "flex h-11 items-center gap-3 rounded-md px-3 text-sm",
                      active ? "bg-raised text-fg" : "text-muted hover:bg-raised/60 hover:text-fg",
                    )}
                  >
                    <Icon className="size-4 shrink-0" strokeWidth={1.75} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  useStoreHydration();
  const [open, setOpen] = useState(false);
  const s = useApex();
  const { mrr, margin, dueToday } = kpis(s);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-line bg-bg lg:flex print:hidden">
        <Brand />
        <div className="flex-1 overflow-y-auto pt-2">
          <NavBody />
        </div>
        <FooterStrip mrr={mrr} margin={margin} due={dueToday.length} />
      </aside>

      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-line bg-bg/90 px-3 backdrop-blur lg:hidden print:hidden">
        <button type="button" className="grid size-11 place-items-center" onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu className="size-5" />
        </button>
        <div className="flex items-center gap-2 text-fg">
          <ApexMark className="size-5" />
          <span className="font-display text-lg">Apexline</span>
        </div>
        <span className="text-xs tabular text-muted">{usd(mrr)}</span>
      </header>

      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button className="absolute inset-0 bg-bg/70" aria-label="Close menu" onClick={() => setOpen(false)} />
          <div className="relative flex h-full w-72 max-w-[85vw] flex-col bg-surface hair">
            <div className="flex h-14 items-center justify-between px-3">
              <Brand compact />
              <button type="button" className="grid size-11 place-items-center" onClick={() => setOpen(false)} aria-label="Close">
                <X className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <NavBody onGo={() => setOpen(false)} />
            </div>
          </div>
        </div>
      ) : null}

      <div className="lg:pl-60">
        <div className="border-b border-line bg-bg px-4 py-2 text-xs text-muted sm:px-8 print:hidden">
          Drafts only. Apexline never sends outreach, never auto-bids, never starts vendor work before payment.
        </div>
        <main className="px-4 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  );
}

function Brand({ compact }: { compact?: boolean }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2.5 px-4 text-fg", compact ? "h-12" : "h-16")}>
      <ApexMark className="size-6" />
      <div className="leading-tight">
        <div className="font-display text-lg tracking-tight">Apexline</div>
        {!compact ? <div className="text-[10px] uppercase tracking-[0.16em] text-faint">BPO operating system</div> : null}
      </div>
    </Link>
  );
}

function FooterStrip({ mrr, margin, due }: { mrr: number; margin: number; due: number }) {
  return (
    <div className="border-t border-line px-4 py-3 text-xs text-muted">
      <div className="flex justify-between tabular">
        <span>MRR</span>
        <span className="text-fg">{usd(mrr)}</span>
      </div>
      <div className="mt-1 flex justify-between tabular">
        <span>Gross margin</span>
        <span className={margin >= 45 ? "text-gain" : "text-warn"}>{margin.toFixed(0)}%</span>
      </div>
      <div className="mt-1 flex justify-between">
        <span>Due today</span>
        <span className="text-fg">{due}</span>
      </div>
    </div>
  );
}
