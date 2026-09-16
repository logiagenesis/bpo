import { cn } from "@/lib/utils";

export function Badge({
  children,
  tone = "muted",
  className,
}: {
  children: React.ReactNode;
  tone?: "muted" | "gain" | "loss" | "warn" | "info" | "accent";
  className?: string;
}) {
  const map = {
    muted: "text-muted bg-raised",
    gain: "text-gain bg-gain/10",
    loss: "text-loss bg-loss/10",
    warn: "text-warn bg-warn/10",
    info: "text-info bg-info/10",
    accent: "text-accent-fg bg-accent",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", map[tone], className)}>
      {children}
    </span>
  );
}
