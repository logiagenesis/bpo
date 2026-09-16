import type { ErrorComponentProps } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

/**
 * Router-level fallback. Keeps the desk usable when a route throws: the
 * operator gets the message and a way back rather than a blank screen.
 */
export function AppErrorComponent({ error, reset }: ErrorComponentProps) {
  const message = error instanceof Error ? error.message : String(error);

  return (
    <div className="rounded-xl bg-surface px-6 py-12 text-center hair">
      <p className="font-display text-xl text-fg">This screen failed to load.</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">
        Your workspace data is untouched — it lives in this browser. Retry, or reload the desk.
      </p>
      <pre className="mx-auto mt-4 max-w-md overflow-x-auto rounded-md bg-raised px-3 py-2 text-left font-mono text-xs text-faint">
        {message}
      </pre>
      <div className="mt-4 flex justify-center gap-2">
        <Button size="sm" onClick={reset}>
          Retry
        </Button>
        <Button size="sm" variant="outline" onClick={() => window.location.assign("/")}>
          Back to command
        </Button>
      </div>
    </div>
  );
}
