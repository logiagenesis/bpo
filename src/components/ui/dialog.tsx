import { useEffect } from "react";
import { cn } from "@/lib/utils";

export function Dialog({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <button className="absolute inset-0 bg-bg/70" aria-label="Close" onClick={onClose} />
      <div
        role="dialog"
        aria-modal
        aria-labelledby="dlg-title"
        className={cn(
          "relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-t-xl bg-surface p-5 hair sm:rounded-xl",
          wide ? "sm:max-w-3xl" : "sm:max-w-lg",
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id="dlg-title" className="font-display text-2xl text-fg">
            {title}
          </h2>
          <button type="button" onClick={onClose} className="size-11 text-muted hover:text-fg">
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
