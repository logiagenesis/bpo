export function PageHeader({
  kicker,
  title,
  action,
  children,
}: {
  kicker: string;
  title: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-muted">{kicker}</p>
        <h1 className="mt-1 font-display text-3xl font-medium tracking-tight text-fg sm:text-4xl">{title}</h1>
        {children ? <p className="mt-2 max-w-2xl text-sm text-muted">{children}</p> : null}
      </div>
      {action ? <div className="flex flex-wrap gap-2">{action}</div> : null}
    </header>
  );
}
