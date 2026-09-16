import { cn } from "@/lib/utils";

export function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "gain" | "loss" | "warn" | "default";
}) {
  return (
    <div className="rounded-xl bg-surface p-4 hair">
      <p className="text-xs uppercase tracking-[0.16em] text-muted">{label}</p>
      <p
        className={cn(
          "mt-2 font-display text-2xl tabular tracking-tight sm:text-3xl",
          tone === "gain" && "text-gain",
          tone === "loss" && "text-loss",
          tone === "warn" && "text-warn",
          (!tone || tone === "default") && "text-fg",
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-faint">{hint}</p> : null}
    </div>
  );
}
