"use client";

import * as React from "react";
import {
  DAY_NAMES,
  DEFAULT_RULES,
  findIssues,
  minutesLabel,
  toICS,
  type Issue,
  type Person,
  type Shift,
} from "@/lib/shift";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * A week board. Pick a person, then press and drag down a day column to lay
 * a shift; drag a shift's bottom edge to resize; click a shift to remove it.
 * Every change re-runs the checks, and issues are listed beside the board
 * and highlighted on it. Export writes an .ics the calendar app can open.
 */

const HOURS = { start: 6, end: 24 };
const SLOT = 30; // minutes per grid step
const ROWS = ((HOURS.end - HOURS.start) * 60) / SLOT;

const PEOPLE: Person[] = [
  { id: "p1", name: "Ada" },
  { id: "p2", name: "Grace" },
  { id: "p3", name: "Linus" },
  { id: "p4", name: "Mae" },
];
const COLOURS: Record<string, string> = {
  p1: "bg-signal/30 border-signal/60",
  p2: "bg-accent/25 border-accent/60",
  p3: "bg-ink/15 border-ink/40",
  p4: "bg-signal/15 border-signal/40",
};

const SEED: Shift[] = [
  { id: "s1", personId: "p1", day: 0, start: 480, end: 960 },
  { id: "s2", personId: "p2", day: 0, start: 900, end: 1260 },
  { id: "s3", personId: "p1", day: 1, start: 420, end: 900 },
  { id: "s4", personId: "p3", day: 1, start: 840, end: 1200 },
  { id: "s5", personId: "p2", day: 2, start: 480, end: 1020 },
  { id: "s6", personId: "p4", day: 2, start: 720, end: 1200 },
  { id: "s7", personId: "p3", day: 3, start: 480, end: 960 },
  { id: "s8", personId: "p1", day: 3, start: 1200, end: 1440 },
  { id: "s9", personId: "p1", day: 4, start: 420, end: 900 },
  { id: "s10", personId: "p4", day: 4, start: 900, end: 1200 },
  { id: "s11", personId: "p2", day: 5, start: 540, end: 1080 },
];

let counter = 100;
const nextId = () => `s${++counter}`;

export function ShiftBoard({ compact = false }: { compact?: boolean }) {
  const [shifts, setShifts] = React.useState<Shift[]>(SEED);
  const [person, setPerson] = React.useState("p1");
  const [draft, setDraft] = React.useState<Shift | null>(null);
  const grid = React.useRef<HTMLDivElement>(null);
  const issues = React.useMemo(() => findIssues(shifts), [shifts]);

  const flagged = React.useMemo(() => {
    const ids = new Set<string>();
    for (const issue of issues) {
      if (issue.kind === "overlap" || issue.kind === "rest") issue.shifts.forEach((s) => ids.add(s));
    }
    return ids;
  }, [issues]);

  /** Pointer position to a (day, minute) cell on the board. */
  const locate = (event: React.PointerEvent) => {
    const node = grid.current;
    if (!node) return null;
    const rect = node.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    if (x < 0 || x >= 1 || y < 0 || y > 1) return null;
    const day = Math.min(6, Math.floor(x * 7));
    const row = Math.min(ROWS, Math.max(0, Math.round(y * ROWS)));
    return { day, minute: HOURS.start * 60 + row * SLOT };
  };

  const onDown = (event: React.PointerEvent) => {
    if ((event.target as HTMLElement).closest("[data-shift]")) return;
    const cell = locate(event);
    if (!cell) return;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    setDraft({ id: nextId(), personId: person, day: cell.day, start: cell.minute, end: cell.minute + SLOT });
  };
  const onMove = (event: React.PointerEvent) => {
    if (!draft) return;
    const cell = locate(event);
    if (!cell) return;
    const end = Math.max(draft.start + SLOT, cell.minute);
    if (end !== draft.end) setDraft({ ...draft, end });
  };
  const onUp = () => {
    if (draft) setShifts((all) => [...all, draft]);
    setDraft(null);
  };

  const remove = (id: string) => setShifts((all) => all.filter((s) => s.id !== id));

  const exportICS = () => {
    const monday = new Date();
    monday.setHours(0, 0, 0, 0);
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7) + 7);
    const blob = new Blob([toICS(shifts, PEOPLE, monday)], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "shifts.ics";
    a.click();
    URL.revokeObjectURL(url);
  };

  const total = (id: string) => shifts.filter((s) => s.personId === id).reduce((m, s) => m + s.end - s.start, 0);
  const rowsForShift = (s: Shift) => ({
    top: `${(((s.start - HOURS.start * 60) / SLOT) / ROWS) * 100}%`,
    height: `${(((s.end - s.start) / SLOT) / ROWS) * 100}%`,
  });

  return (
    <div className={compact ? "" : "grid gap-6 lg:grid-cols-[1fr_17rem]"}>
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="label mr-1">Laying shifts for</span>
          {PEOPLE.map((p) => (
            <button
              key={p.id}
              type="button"
              aria-pressed={person === p.id}
              onClick={() => setPerson(p.id)}
              className={cn(
                "rounded-full border px-3 py-1 text-sm transition-colors",
                person === p.id ? "border-ink bg-ink text-ground" : "border-line text-ink-muted hover:text-ink",
              )}
            >
              {p.name}
              <span className="label ml-2 tabular">{(total(p.id) / 60).toFixed(0)}h</span>
            </button>
          ))}
        </div>

        <div className={compact ? "overflow-x-auto rounded-lg bg-ground" : "overflow-x-auto rounded-2xl border border-line bg-surface"}>
          <div className={compact ? "min-w-[520px]" : "min-w-[640px]"}>
            <div className="grid grid-cols-[3rem_repeat(7,1fr)] border-b border-line">
              <div />
              {DAY_NAMES.map((d) => (
                <div key={d} className="label py-2 text-center">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-[3rem_repeat(7,1fr)]">
              <div className="relative" style={{ height: `${ROWS * (compact ? 8 : 14)}px` }}>
                {Array.from({ length: HOURS.end - HOURS.start + 1 }, (_, i) => (
                  <span
                    key={i}
                    className="label absolute right-2 -translate-y-1/2 tabular"
                    style={{ top: `${(i / (HOURS.end - HOURS.start)) * 100}%` }}
                  >
                    {String(HOURS.start + i).padStart(2, "0")}
                  </span>
                ))}
              </div>
              <div
                ref={grid}
                className="relative col-span-7 grid touch-none select-none grid-cols-7"
                style={{ height: `${ROWS * (compact ? 8 : 14)}px` }}
                onPointerDown={onDown}
                onPointerMove={onMove}
                onPointerUp={onUp}
                onPointerCancel={() => setDraft(null)}
              >
                {DAY_NAMES.map((d, day) => (
                  <div
                    key={d}
                    className="relative border-l border-line bg-[repeating-linear-gradient(to_bottom,transparent_0,transparent_27px,var(--color-line)_27px,var(--color-line)_28px)]"
                  >
                    {/* Coverage window shading */}
                    <div
                      aria-hidden
                      className="absolute inset-x-0 bg-ink/[0.03]"
                      style={{
                        top: `${(((DEFAULT_RULES.coverage.start - HOURS.start * 60) / SLOT) / ROWS) * 100}%`,
                        height: `${(((DEFAULT_RULES.coverage.end - DEFAULT_RULES.coverage.start) / SLOT) / ROWS) * 100}%`,
                      }}
                    />
                    {issues
                      .filter((i): i is Extract<Issue, { kind: "gap" }> => i.kind === "gap" && i.day === day)
                      .map((g, k) => (
                        <div
                          key={k}
                          aria-hidden
                          className="absolute inset-x-1 rounded border border-dashed border-accent/50"
                          style={{
                            top: `${(((g.start - HOURS.start * 60) / SLOT) / ROWS) * 100}%`,
                            height: `${(((g.end - g.start) / SLOT) / ROWS) * 100}%`,
                          }}
                        />
                      ))}
                    {[...shifts, ...(draft && draft.day === day ? [draft] : [])]
                      .filter((s) => s.day === day)
                      .map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          data-shift
                          onClick={() => remove(s.id)}
                          title={`${PEOPLE.find((p) => p.id === s.personId)?.name} ${minutesLabel(s.start)} to ${minutesLabel(s.end)}. Click to remove.`}
                          className={cn(
                            "absolute inset-x-1 overflow-hidden rounded-md border px-1.5 py-1 text-left text-[0.7rem] leading-tight text-ink transition-colors",
                            COLOURS[s.personId],
                            flagged.has(s.id) && "ring-2 ring-accent",
                            s.id === draft?.id && "opacity-70",
                          )}
                          style={rowsForShift(s)}
                        >
                          <span className="font-medium">{PEOPLE.find((p) => p.id === s.personId)?.name}</span>
                          <span className="label block tabular">
                            {minutesLabel(s.start)}–{minutesLabel(s.end)}
                          </span>
                        </button>
                      ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {!compact && <p className="label mt-3">
          Press and drag down a day to lay a shift. Click a shift to remove it. Shaded band is the
          cover window, {minutesLabel(DEFAULT_RULES.coverage.start)} to {minutesLabel(DEFAULT_RULES.coverage.end)}.
        </p>}
      </div>

      {!compact && <aside className="space-y-5">
        <div className="flex items-baseline justify-between border-b border-line pb-3">
          <h2 className="label">Issues</h2>
          <span className="font-mono text-sm text-ink tabular">{issues.length}</span>
        </div>
        {issues.length === 0 ? (
          <p className="text-sm text-ink-muted">Clean week. Nobody double-booked, everyone rested, every hour covered.</p>
        ) : (
          <ul className="max-h-[28rem] space-y-2 overflow-y-auto pr-1 text-sm">
            {issues.map((issue, i) => (
              <li key={i} className="rounded-lg border border-line bg-surface p-3 text-ink-muted">
                {issue.kind === "overlap" && (
                  <>
                    <span className="text-accent">Double-booked.</span>{" "}
                    {PEOPLE.find((p) => p.id === issue.personId)?.name} has two shifts that overlap.
                  </>
                )}
                {issue.kind === "rest" && (
                  <>
                    <span className="text-accent">Short rest.</span>{" "}
                    {PEOPLE.find((p) => p.id === issue.personId)?.name} gets {(issue.gap / 60).toFixed(1)} h off; the rule is{" "}
                    {DEFAULT_RULES.minRest / 60}.
                  </>
                )}
                {issue.kind === "gap" && (
                  <>
                    <span className="text-accent">No cover.</span> {DAY_NAMES[issue.day]}{" "}
                    {minutesLabel(issue.start)} to {minutesLabel(issue.end)}.
                  </>
                )}
                {issue.kind === "hours" && (
                  <>
                    <span className="text-accent">Over hours.</span>{" "}
                    {PEOPLE.find((p) => p.id === issue.personId)?.name} is at {(issue.minutes / 60).toFixed(0)} h; the cap is{" "}
                    {DEFAULT_RULES.maxWeekly / 60}.
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap gap-2 border-t border-line pt-4">
          <Button variant="solid" size="sm" onClick={exportICS}>
            Export .ics
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShifts([])}>
            Clear week
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShifts(SEED)}>
            Reset
          </Button>
        </div>
      </aside>}
    </div>
  );
}
