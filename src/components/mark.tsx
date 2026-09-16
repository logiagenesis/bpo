export function ApexMark({ className = "size-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <path
        d="M4 26 L16 6 L28 26"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="miter"
      />
      <path d="M10 26 H22" fill="none" stroke="currentColor" strokeWidth="2.2" />
    </svg>
  );
}
