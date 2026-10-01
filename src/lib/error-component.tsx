import type { ErrorComponentProps } from '@tanstack/react-router';
export function AppErrorComponent({ error, reset }: ErrorComponentProps) {
  return <div role="alert" className="p-8"><h1>Something went wrong</h1><p>{error instanceof Error ? error.message : 'Please try again.'}</p><button onClick={reset}>Try again</button></div>;
}

