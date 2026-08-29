import { cn } from "@/lib/utils";

/** Shared metric block for the private calculators. */
export function Stat({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn("border-t border-line py-4", className)}>
      <p className="label">{label}</p>
      <p className="tabular mt-1.5 font-mono text-xl text-ink">{value}</p>
      {hint && <p className="mt-1 text-[0.8125rem] text-ink-faint">{hint}</p>}
    </div>
  );
}

export function StatGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-x-8 sm:grid-cols-3">{children}</div>
  );
}
