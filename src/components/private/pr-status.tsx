"use client";

import * as React from "react";
import type { Absence, Milestone } from "@/private/schedule";
import {
  absentDayCount,
  computeBreakdown,
  earliestEligibleDate,
  REQUIRED_DAYS,
  MAX_PRE_PR_CREDIT,
} from "@/private/citizenship";
import { isIsoDate, prettyDate } from "@/private/workdays";
import { usePacificNow, useStoredValue } from "@/private/use-browser";
import { AbsenceDialog } from "@/components/private/absence-dialog";
import { Stat, StatGrid } from "@/components/private/stat";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "canadaAbsences";

function reviveAbsences(raw: string): Absence[] | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    const out: Absence[] = [];
    for (const item of parsed) {
      if (typeof item !== "object" || item === null) continue;
      const o = item as Record<string, unknown>;
      const from = String(o["from"] ?? "");
      const to = String(o["to"] ?? "");
      if (!isIsoDate(from) || !isIsoDate(to)) continue;
      out.push({
        id: String(o["id"] ?? from),
        from,
        to,
        note: typeof o["note"] === "string" ? o["note"] : undefined,
      });
    }
    return out;
  } catch {
    return null;
  }
}

export function PrStatus({
  milestones,
  prDate,
  knownAbsences,
}: {
  milestones: Milestone[];
  prDate: string;
  knownAbsences: Absence[];
}) {
  const now = usePacificNow(3_600_000);
  const today = now?.date ?? null;
  const [absences, setAbsences] = useStoredValue(
    STORAGE_KEY,
    knownAbsences,
    reviveAbsences,
  );

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Absence | null>(null);

  const sorted = React.useMemo(
    () => [...absences].sort((a, b) => a.from.localeCompare(b.from)),
    [absences],
  );

  const eligible = React.useMemo(
    () => (today ? earliestEligibleDate(today, prDate, absences) : null),
    [today, prDate, absences],
  );

  // Presence as it stands today, and what it will look like on the earliest
  // day the requirement is met.
  const todayBreakdown = React.useMemo(
    () => (today ? computeBreakdown(today, prDate, absences) : null),
    [today, prDate, absences],
  );
  const targetBreakdown = React.useMemo(
    () => (eligible ? computeBreakdown(eligible, prDate, absences) : null),
    [eligible, prDate, absences],
  );

  const daysAway = absences.reduce((sum, a) => sum + absentDayCount(a), 0);
  const percent = todayBreakdown
    ? Math.min(100, (todayBreakdown.total / REQUIRED_DAYS) * 100)
    : 0;

  function save(absence: Absence) {
    const next = absences.some((a) => a.id === absence.id)
      ? absences.map((a) => (a.id === absence.id ? absence : a))
      : [...absences, absence];
    setAbsences(next);
  }

  function remove(id: string) {
    setAbsences(absences.filter((a) => a.id !== id));
  }

  return (
    <div>
      {/* ------------------------------------------------------ Celebration */}
      <div className="rounded-2xl border border-line bg-paper-raised p-6 sm:p-10">
        <p className="eyebrow flex items-center gap-2">
          <span aria-hidden className="size-1.5 rounded-full bg-signal" />
          Complete
        </p>
        <h1 className="mt-4 max-w-[18ch] font-display text-[clamp(2.25rem,1.4rem+3.4vw,4rem)] leading-[1.02] tracking-tight">
          Permanent resident of Canada.
        </h1>
        <p className="mt-4 max-w-[54ch] text-lead text-ink-muted">
          Filed {prettyDate(milestones[0]?.date ?? prDate)}, confirmed{" "}
          {prettyDate(prDate)}. Card in hand{" "}
          {prettyDate(milestones[milestones.length - 1]?.date ?? prDate)}.
        </p>
      </div>

      {/* --------------------------------------------------------- Timeline */}
      <section className="mt-12 border-t border-line pt-5">
        <h2 className="eyebrow">How it went</h2>
        <ol className="mt-6">
          {milestones.map((milestone, i) => {
            const previous = milestones[i - 1];
            const gap = previous
              ? Math.round(
                  (new Date(milestone.date).getTime() -
                    new Date(previous.date).getTime()) /
                    86_400_000,
                )
              : null;
            return (
              <li
                key={milestone.date}
                className="grid gap-2 border-t border-line py-4 sm:grid-cols-[9rem_1fr_auto] sm:items-baseline sm:gap-6"
              >
                <p className="tabular font-mono text-[0.8125rem] text-ink-faint">
                  {prettyDate(milestone.date)}
                </p>
                <p className="text-[0.9375rem] text-ink">
                  {milestone.label}
                  {milestone.detail && (
                    <span className="text-ink-muted"> · {milestone.detail}</span>
                  )}
                </p>
                {gap !== null && (
                  <p className="tabular font-mono text-[0.75rem] text-ink-faint">
                    +{gap}d
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      </section>

      {/* ------------------------------------------------------ Citizenship */}
      <section className="mt-14 border-t border-line pt-5">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="eyebrow">Toward citizenship</h2>
          <p className="text-[0.8125rem] text-ink-faint">
            {REQUIRED_DAYS} days of presence in the five years before applying
          </p>
        </div>

        {todayBreakdown === null ? (
          <p className="mt-6 text-[0.9375rem] text-ink-faint">Working it out.</p>
        ) : (
          <>
            <p className="tabular mt-8 font-display text-[clamp(3rem,10vw,5.5rem)] leading-none">
              {todayBreakdown.total}
              <span className="text-ink-faint">/{REQUIRED_DAYS}</span>
            </p>
            <div
              role="progressbar"
              aria-valuenow={Math.round(percent)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Physical presence toward citizenship"
              className="mt-6 h-2 w-full overflow-hidden rounded-full bg-paper-sunken"
            >
              <div
                className="h-full rounded-full bg-signal transition-[width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ width: `${percent}%` }}
              />
            </div>

            <StatGrid>
              <Stat
                label="Earliest application"
                value={eligible ? prettyDate(eligible) : "not reachable"}
                hint={
                  eligible && today
                    ? `${Math.max(
                        0,
                        Math.round(
                          (new Date(eligible).getTime() -
                            new Date(today).getTime()) /
                            86_400_000,
                        ),
                      )} days away`
                    : "Too much time outside Canada"
                }
              />
              <Stat
                label="Days as a PR"
                value={todayBreakdown.prDays}
                hint="Counted in full"
              />
              <Stat
                label="Credit before PR"
                value={todayBreakdown.prePrCredit}
                hint={
                  todayBreakdown.prePrCredit >= MAX_PRE_PR_CREDIT
                    ? "Capped at 365"
                    : "Half a day each"
                }
              />
              <Stat
                label="Still needed"
                value={todayBreakdown.shortfall}
                hint="Days of credit"
              />
              <Stat
                label="Days outside Canada"
                value={daysAway}
                hint={`${absences.length} trip${absences.length === 1 ? "" : "s"} recorded`}
              />
              <Stat
                label="Window opens"
                value={prettyDate(todayBreakdown.windowStart)}
                hint="Five years back from today"
              />
            </StatGrid>

            {targetBreakdown && eligible && (
              <p className="mt-8 max-w-[64ch] text-[0.875rem] leading-relaxed text-ink-muted">
                On {prettyDate(eligible)} you would have{" "}
                <span className="tabular font-mono text-ink">
                  {targetBreakdown.prDays}
                </span>{" "}
                days as a permanent resident plus{" "}
                <span className="tabular font-mono text-ink">
                  {targetBreakdown.prePrCredit}
                </span>{" "}
                days of credit from before. Every extra day outside Canada
                between now and then pushes that date back by a day.
              </p>
            )}
          </>
        )}
      </section>

      {/* --------------------------------------------------------- Absences */}
      <section className="mt-14 border-t border-line pt-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="eyebrow">Time outside Canada</h2>
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Add a trip
          </button>
        </div>

        {sorted.length === 0 ? (
          <p className="mt-6 text-[0.9375rem] text-ink-muted">
            Nothing recorded. Every day counts as a day in Canada until you add a
            trip.
          </p>
        ) : (
          <ul className="mt-6">
            {sorted.map((absence) => {
              const days = absentDayCount(absence);
              const beforePr = absence.to < prDate;
              return (
                <li key={absence.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(absence);
                      setDialogOpen(true);
                    }}
                    className="group flex w-full items-center justify-between gap-6 border-t border-line py-4 text-left transition-colors hover:border-ink"
                  >
                    <span className="min-w-0">
                      <span className="tabular block font-mono text-[0.8125rem] text-ink">
                        {prettyDate(absence.from)} to {prettyDate(absence.to)}
                      </span>
                      <span className="mt-1 block text-[0.8125rem] text-ink-muted">
                        {absence.note ?? "No note"}
                        <span className="text-ink-faint">
                          {" "}
                          · {beforePr ? "before PR" : "as a PR"}
                        </span>
                      </span>
                    </span>
                    <span
                      className={cn(
                        "tabular shrink-0 rounded-full px-3 py-1 font-mono text-[0.75rem]",
                        days === 0
                          ? "bg-paper-sunken text-ink-faint"
                          : "bg-signal-soft text-signal",
                      )}
                    >
                      {days}d
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <p className="mt-6 max-w-[64ch] text-[0.75rem] leading-relaxed text-ink-faint">
          Stored in this browser only, seeded with what is already known. Use the
          same browser or re-enter trips elsewhere. This is a planning estimate,
          not the official count: IRCC&rsquo;s own presence calculator is what
          the application is judged on.
        </p>
      </section>

      <AbsenceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        onSave={save}
        onDelete={remove}
      />
    </div>
  );
}
