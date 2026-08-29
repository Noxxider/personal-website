"use client";

import * as React from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Taps older than this end the run, so you can start over by pausing. */
const RESET_AFTER_MS = 2000;
/** Number of intervals averaged into the reading. */
const WINDOW = 8;

export function TapBpm() {
  const [taps, setTaps] = React.useState<number[]>([]);
  const [pulse, setPulse] = React.useState(0);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  React.useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const registerTap = React.useCallback(() => {
    const now = performance.now();
    setTaps((prev) => {
      const last = prev[prev.length - 1];
      const next =
        last !== undefined && now - last > RESET_AFTER_MS ? [now] : [...prev, now];
      return next.slice(-(WINDOW + 1));
    });
    setPulse((p) => p + 1);

    // Clear the reading once the run has clearly ended.
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setTaps([]), RESET_AFTER_MS * 4);
  }, []);

  function reset() {
    clearTimeout(timeoutRef.current);
    setTaps([]);
  }

  const intervals = taps.slice(1).map((t, i) => t - taps[i]!);
  const bpm =
    intervals.length > 0
      ? 60_000 / (intervals.reduce((a, b) => a + b, 0) / intervals.length)
      : null;

  const stability =
    intervals.length > 1
      ? (() => {
          const mean =
            intervals.reduce((a, b) => a + b, 0) / intervals.length;
          const variance =
            intervals.reduce((a, b) => a + (b - mean) ** 2, 0) /
            intervals.length;
          return Math.sqrt(variance) / mean;
        })()
      : null;

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_20rem] lg:gap-14">
      <div>
        <button
          type="button"
          onClick={registerTap}
          onKeyDown={(e) => {
            // Space and Enter already fire click; keep the default behaviour.
            if (e.key === " " || e.key === "Enter") e.preventDefault();
          }}
          onKeyUp={(e) => {
            if (e.key === " " || e.key === "Enter") registerTap();
          }}
          className="group relative flex aspect-[4/3] w-full touch-manipulation select-none flex-col items-center justify-center rounded-2xl border border-line bg-paper-raised transition-colors duration-150 hover:border-ink-faint active:bg-paper-sunken sm:aspect-[16/9]"
          aria-label="Tap to register a beat"
        >
          {pulse > 0 && (
            <span
              key={pulse}
              aria-hidden
              className="tap-pulse pointer-events-none absolute inset-0 rounded-2xl border border-signal"
            />
          )}
          {bpm ? (
            <>
              <span className="tabular font-display text-[clamp(4rem,14vw,8rem)] leading-none text-ink">
                {Math.round(bpm)}
              </span>
              <span className="eyebrow mt-3">Beats per minute</span>
            </>
          ) : (
            <>
              <span className="font-display text-[clamp(2rem,5vw,3rem)] leading-none text-ink-faint">
                Tap in time
              </span>
              <span className="eyebrow mt-4">
                Click, tap, or press space
              </span>
            </>
          )}
        </button>

        <p aria-live="polite" className="sr-only">
          {bpm ? `${Math.round(bpm)} beats per minute` : "Waiting for taps"}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={reset}
            className={buttonVariants({ variant: "outline", size: "sm" })}
            disabled={taps.length === 0}
          >
            Reset
          </button>
          <p className="text-[0.8125rem] text-ink-faint">
            Pause for two seconds and it starts a fresh run.
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-8 self-start lg:grid-cols-1">
        <div className="border-t border-line py-4">
          <dt className="eyebrow">Taps counted</dt>
          <dd className="tabular mt-1.5 font-mono text-lg text-ink">
            {taps.length}
          </dd>
        </div>
        <div className="border-t border-line py-4">
          <dt className="eyebrow">Averaged over</dt>
          <dd className="tabular mt-1.5 font-mono text-lg text-ink">
            {intervals.length} {intervals.length === 1 ? "interval" : "intervals"}
          </dd>
        </div>
        <div className="border-t border-line py-4">
          <dt className="eyebrow">Steadiness</dt>
          <dd
            className={cn(
              "mt-1.5 font-mono text-lg",
              stability === null
                ? "text-ink-faint"
                : stability < 0.06
                  ? "text-ink"
                  : "text-ink-muted",
            )}
          >
            {stability === null
              ? "not yet"
              : stability < 0.04
                ? "Very steady"
                : stability < 0.09
                  ? "Steady"
                  : "Loose"}
          </dd>
        </div>
        <div className="border-t border-line py-4">
          <dt className="eyebrow">Exact</dt>
          <dd className="tabular mt-1.5 font-mono text-lg text-ink">
            {bpm ? bpm.toFixed(1) : "not yet"}
          </dd>
        </div>
      </dl>
    </div>
  );
}
