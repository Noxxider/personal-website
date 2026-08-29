"use client";

import { cn } from "@/lib/utils";

export type Bar = { label: string; value: number; caption?: string };

/**
 * Categorical bar chart built from divs rather than SVG, so the labels stay at
 * real text size at every width and the whole thing reflows on a phone.
 * Handles negative values by splitting around a centre line.
 */
export function BarChart({
  bars,
  signed = false,
  format = (v: number) => String(v),
  className,
  emptyLabel = "Nothing to show",
}: {
  bars: Bar[];
  /** Values can be negative, for example a correlation. */
  signed?: boolean;
  format?: (value: number) => string;
  className?: string;
  emptyLabel?: string;
}) {
  if (bars.length === 0) {
    return (
      <p className={cn("text-[0.9375rem] text-ink-faint", className)}>
        {emptyLabel}
      </p>
    );
  }

  const max = Math.max(...bars.map((b) => Math.abs(b.value)), 1);

  return (
    <ul className={cn("space-y-1.5", className)}>
      {bars.map((bar) => {
        const width = (Math.abs(bar.value) / max) * 100;
        const negative = bar.value < 0;
        return (
          <li key={bar.label} className="grid grid-cols-[5.5rem_1fr_auto] items-center gap-3">
            <span className="truncate font-mono text-[0.6875rem] text-ink-faint">
              {bar.label}
            </span>
            <span
              className={cn(
                "flex h-4",
                signed && "justify-center",
              )}
            >
              <span className={cn("flex w-full", signed && negative && "justify-end")}>
                <span
                  className={cn(
                    "h-full rounded-sm",
                    bar.value === 0
                      ? "bg-line-strong"
                      : negative
                        ? "bg-ink-faint"
                        : "bg-signal/70",
                  )}
                  style={{ width: `${signed ? width / 2 : width}%`, minWidth: bar.value === 0 ? 2 : 3 }}
                />
              </span>
            </span>
            <span className="tabular font-mono text-[0.75rem] text-ink-muted">
              {bar.caption ?? format(bar.value)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
