"use client";

import * as React from "react";
import { LineChart, type Point } from "@/components/line-chart";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Unit = "kg" | "lb";

type Result = {
  points: Point[];
  average: number;
  net: number;
  min: number;
  max: number;
  range: number;
  perDay: number;
};

const SAMPLE = "72.4 72.1 72.3 71.8 71.9 71.4 71.6 71.1 70.9 71.0 70.6 70.4";

function parseWeights(raw: string): { values: number[]; error: string | null } {
  const tokens = raw
    .split(/[\s,;]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  if (tokens.length === 0) {
    return { values: [], error: "Enter at least two weigh-ins to see a trend." };
  }

  const values: number[] = [];
  for (const token of tokens) {
    const n = Number(token);
    if (!Number.isFinite(n) || n <= 0) {
      return { values: [], error: `"${token}" is not a weight I can read.` };
    }
    values.push(n);
  }

  if (values.length < 2) {
    return { values: [], error: "Enter at least two weigh-ins to see a trend." };
  }
  if (values.length > 400) {
    return {
      values: [],
      error: "That is more than 400 readings. Trim it down a little.",
    };
  }

  return { values, error: null };
}

function toISO(d: Date): string {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10);
}

function compute(values: number[], startISO: string): Result {
  const start = new Date(`${startISO}T00:00:00`);
  const points: Point[] = values.map((v, i) => ({
    t: start.getTime() + i * 86_400_000,
    v,
  }));
  const total = values.reduce((a, b) => a + b, 0);
  const first = values[0]!;
  const last = values[values.length - 1]!;
  const min = Math.min(...values);
  const max = Math.max(...values);
  return {
    points,
    average: total / values.length,
    net: last - first,
    min,
    max,
    range: max - min,
    perDay: (last - first) / Math.max(1, values.length - 1),
  };
}

const signed = (n: number, digits = 2) =>
  `${n > 0 ? "+" : ""}${n.toFixed(digits)}`;

export function WeightTracker() {
  // The start date is optional. Left blank, the run is assumed to end today,
  // which keeps this component free of any date work during render or hydration.
  const [raw, setRaw] = React.useState("");
  const [startDate, setStartDate] = React.useState("");
  const [unit, setUnit] = React.useState<Unit>("kg");
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<Result | null>(null);
  const errorId = React.useId();

  function run(nextRaw = raw, nextStart = startDate) {
    setSubmitted(true);
    const { values, error: parseError } = parseWeights(nextRaw);
    if (parseError) {
      setError(parseError);
      setResult(null);
      return;
    }
    // No start date given: assume the last reading is today.
    const start =
      nextStart || toISO(new Date(Date.now() - (values.length - 1) * 86_400_000));
    if (Number.isNaN(Date.parse(`${start}T00:00:00`))) {
      setError("That start date is not one I can read.");
      setResult(null);
      return;
    }
    setError(null);
    setResult(compute(values, start));
  }

  function loadSample() {
    const iso = toISO(new Date(Date.now() - 11 * 86_400_000));
    setRaw(SAMPLE);
    setStartDate(iso);
    run(SAMPLE, iso);
  }

  function reset() {
    setRaw("");
    setStartDate("");
    setResult(null);
    setError(null);
    setSubmitted(false);
  }

  const stats = result
    ? [
        { label: "Average", value: `${result.average.toFixed(2)} ${unit}` },
        { label: "Net change", value: `${signed(result.net)} ${unit}` },
        { label: "Lowest", value: `${result.min.toFixed(2)} ${unit}` },
        { label: "Highest", value: `${result.max.toFixed(2)} ${unit}` },
        { label: "Range", value: `${result.range.toFixed(2)} ${unit}` },
        { label: "Per day", value: `${signed(result.perDay, 3)} ${unit}` },
      ]
    : [];

  return (
    <div className="grid gap-10 lg:grid-cols-[21rem_1fr] lg:gap-14">
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          run();
        }}
        className="space-y-6"
      >
        <div>
          <Label htmlFor="weights">Weigh-ins, one per day</Label>
          <textarea
            id="weights"
            value={raw}
            onChange={(e) => {
              setRaw(e.target.value);
              if (submitted) setError(null);
            }}
            rows={4}
            inputMode="decimal"
            placeholder="72.4 72.1 72.3 71.8"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `weights-hint ${errorId}` : "weights-hint"}
            className={cn(
              "mt-2 w-full resize-y rounded-lg border bg-paper-raised px-3.5 py-2.5 font-mono text-[0.9375rem] leading-relaxed text-ink transition-colors",
              "placeholder:text-ink-faint focus:outline-none",
              error
                ? "border-signal focus:border-signal"
                : "border-line-strong hover:border-ink-faint focus:border-ink",
            )}
          />
          <p id="weights-hint" className="mt-2 text-[0.8125rem] text-ink-faint">
            Separate them with spaces, commas or new lines.
          </p>
        </div>

        <div className="grid grid-cols-[1fr_auto] gap-3">
          <div className="min-w-0">
            <Label htmlFor="start">First weigh-in</Label>
            <Input
              id="start"
              type="date"
              value={startDate}
              aria-describedby="start-hint"
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-2"
            />
          </div>
          <fieldset className="min-w-0">
            <legend className="text-[0.8125rem] font-medium text-ink-muted">
              Unit
            </legend>
            <div className="mt-2 flex h-11 items-center rounded-lg border border-line-strong p-1">
              {(["kg", "lb"] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUnit(u)}
                  aria-pressed={unit === u}
                  className={cn(
                    "h-full rounded-md px-3 text-[0.8125rem] font-medium transition-colors",
                    unit === u
                      ? "bg-ink text-paper"
                      : "text-ink-muted hover:text-ink",
                  )}
                >
                  {u}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        <p id="start-hint" className="text-[0.8125rem] text-ink-faint">
          Optional. Left blank, the last reading is treated as today.
        </p>

        <p
          id={errorId}
          role="alert"
          className={cn(
            "text-[0.875rem] text-signal",
            error ? "" : "sr-only",
          )}
        >
          {error}
        </p>

        <div className="flex flex-wrap gap-2.5">
          <button type="submit" className={buttonVariants({ size: "sm" })}>
            Show the trend
          </button>
          <button
            type="button"
            onClick={loadSample}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Use sample data
          </button>
          {result && (
            <button
              type="button"
              onClick={reset}
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Reset
            </button>
          )}
        </div>
      </form>

      <div className="min-w-0">
        {result ? (
          <div>
            <div className="rounded-xl border border-line bg-paper-raised p-4 sm:p-6">
              <LineChart
                points={result.points}
                unit={unit}
                label={`Bodyweight trend in ${unit}`}
              />
            </div>
            <dl className="mt-8 grid grid-cols-2 gap-x-8 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="border-t border-line py-4">
                  <dt className="label">{stat.label}</dt>
                  <dd className="tabular mt-1.5 font-mono text-lg text-ink">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ) : (
          <div className="flex min-h-[19rem] flex-col items-start justify-center rounded-xl border border-dashed border-line-strong p-8">
            <p className="font-display text-2xl text-ink">Nothing plotted yet</p>
            <p className="mt-2 max-w-[38ch] text-[0.9375rem] leading-relaxed text-ink-muted">
              Paste a run of weigh-ins on the left, or load the sample data to
              see what it looks like.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
