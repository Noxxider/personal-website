"use client";

import * as React from "react";
import {
  addDays,
  countWeekdays,
  formatDate,
  isIsoDate,
  lastWeekdayBefore,
  parseDate,
  prettyDate,
} from "@/private/workdays";
import { usePacificNow, useStoredValue } from "@/private/use-browser";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stat, StatGrid } from "@/components/private/stat";
import { buttonVariants } from "@/components/ui/button";

const STORAGE_KEY = "probationTracker";

type Stored = { startDate: string; totalDays: number };

const EMPTY: Stored = { startDate: "", totalDays: 90 };

function reviveStored(raw: string): Stored | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const o = parsed as Record<string, unknown>;
    const startDate = typeof o["startDate"] === "string" ? o["startDate"] : "";
    const totalDays = Number(o["totalDays"]);
    return {
      startDate: isIsoDate(startDate) ? startDate : "",
      totalDays: Number.isFinite(totalDays) && totalDays > 0 ? totalDays : 90,
    };
  } catch {
    return null;
  }
}

export function ProbationTracker() {
  const now = usePacificNow(3_600_000);
  const today = now?.date ?? null;
  const [state, setState] = useStoredValue(STORAGE_KEY, EMPTY, reviveStored);
  const { startDate, totalDays } = state;

  const reset = () => setState(EMPTY);

  const result = React.useMemo(() => {
    if (!today || !isIsoDate(startDate) || totalDays <= 0) return null;

    const endIso = formatDate(addDays(parseDate(startDate), totalDays));
    const required = countWeekdays(startDate, endIso);
    if (required === 0) return null;

    // Do not count past the end of probation once it is over.
    const completedThrough = today < endIso ? today : endIso;
    const completed = Math.min(
      required,
      countWeekdays(startDate, completedThrough),
    );
    const lastDay = lastWeekdayBefore(startDate, endIso);

    return {
      required,
      completed,
      remaining: required - completed,
      percent: Math.min(100, (completed / required) * 100),
      lastDay,
      done: completed >= required,
    };
  }, [startDate, totalDays, today]);

  return (
    <div>
      <h1 className="font-display text-title">Probation tracker</h1>
      <p className="mt-2 max-w-[62ch] text-[0.9375rem] leading-relaxed text-ink-muted">
        Counts weekdays from the start date, so it ignores statutory holidays and
        leave. Progress is against working days, not calendar days.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[20rem_1fr] lg:gap-14">
        <div className="space-y-6">
          <div>
            <Label htmlFor="start">Start date</Label>
            <Input
              id="start"
              type="date"
              value={startDate}
              onChange={(e) =>
                setState({ ...state, startDate: e.target.value })
              }
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="length">Probation length in calendar days</Label>
            <Input
              id="length"
              type="number"
              min={1}
              max={1000}
              value={totalDays}
              onChange={(e) =>
                setState({
                  ...state,
                  totalDays: Math.max(1, Number(e.target.value) || 0),
                })
              }
              className="mt-2 max-w-32"
            />
          </div>
          {(startDate || totalDays !== 90) && (
            <button
              type="button"
              onClick={reset}
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Reset
            </button>
          )}
        </div>

        <div className="min-w-0">
          {result === null ? (
            <div className="flex min-h-48 items-center rounded-xl border border-dashed border-line-strong p-8">
              <p className="text-[0.9375rem] text-ink-muted">
                Pick a start date to see the progress.
              </p>
            </div>
          ) : (
            <>
              <p className="tabular font-display text-[clamp(3rem,10vw,5rem)] leading-none text-ink">
                {result.percent.toFixed(1)}%
              </p>
              <div
                role="progressbar"
                aria-valuenow={Math.round(result.percent)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Probation progress"
                className="mt-6 h-2 w-full overflow-hidden rounded-full bg-paper-sunken"
              >
                <div
                  className="h-full rounded-full bg-signal transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{ width: `${result.percent}%` }}
                />
              </div>

              <StatGrid>
                <Stat
                  label="Completed"
                  value={`${result.completed} / ${result.required}`}
                  hint="Working days"
                />
                <Stat label="Remaining" value={result.remaining} hint="Working days" />
                <Stat
                  label="Last day"
                  value={result.lastDay ? prettyDate(result.lastDay) : "not set"}
                />
              </StatGrid>

              {result.done && (
                <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-signal-soft px-3.5 py-1.5 text-[0.8125rem] font-medium text-signal">
                  <span aria-hidden className="size-1.5 rounded-full bg-signal" />
                  Probation complete
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
