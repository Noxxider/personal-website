/**
 * The scheduling toy behind /work/shift. Pure functions over a week of
 * shifts: what clashes, where nobody is on, and the same week as iCalendar.
 * Times are minutes from midnight; days are 0 (Monday) to 6 (Sunday).
 */

export type Person = { id: string; name: string };

export type Shift = {
  id: string;
  personId: string;
  day: number;
  /** Minutes from midnight, inclusive start. */
  start: number;
  /** Minutes from midnight, exclusive end. May exceed 1440 for an overnight. */
  end: number;
};

export type Rules = {
  /** Minimum minutes off between two shifts of the same person. */
  minRest: number;
  /** Hours of the day that must have someone on, each day. */
  coverage: { start: number; end: number };
  /** Maximum minutes a person may work in the week. */
  maxWeekly: number;
};

export const DEFAULT_RULES: Rules = {
  minRest: 11 * 60,
  coverage: { start: 8 * 60, end: 20 * 60 },
  maxWeekly: 44 * 60,
};

export type Issue =
  | { kind: "overlap"; personId: string; shifts: [string, string] }
  | { kind: "rest"; personId: string; shifts: [string, string]; gap: number }
  | { kind: "gap"; day: number; start: number; end: number }
  | { kind: "hours"; personId: string; minutes: number };

/** Absolute minute in the week, so overnight and cross-day maths is plain. */
const abs = (s: Shift) => ({ a: s.day * 1440 + s.start, b: s.day * 1440 + s.end });

export function findIssues(shifts: Shift[], rules: Rules = DEFAULT_RULES): Issue[] {
  const issues: Issue[] = [];
  const byPerson = new Map<string, Shift[]>();
  for (const s of shifts) {
    if (!byPerson.has(s.personId)) byPerson.set(s.personId, []);
    byPerson.get(s.personId)!.push(s);
  }

  for (const [personId, list] of byPerson) {
    const sorted = [...list].sort((x, y) => abs(x).a - abs(y).a);
    let minutes = 0;
    for (let i = 0; i < sorted.length; i++) {
      const s = sorted[i]!;
      minutes += s.end - s.start;
      const next = sorted[i + 1];
      if (!next) continue;
      const gap = abs(next).a - abs(s).b;
      if (gap < 0) issues.push({ kind: "overlap", personId, shifts: [s.id, next.id] });
      else if (gap < rules.minRest) issues.push({ kind: "rest", personId, shifts: [s.id, next.id], gap });
    }
    if (minutes > rules.maxWeekly) issues.push({ kind: "hours", personId, minutes });
  }

  // Coverage: walk each day's window and report stretches with nobody on.
  for (let day = 0; day < 7; day++) {
    const windowStart = day * 1440 + rules.coverage.start;
    const windowEnd = day * 1440 + rules.coverage.end;
    const spans = shifts
      .map(abs)
      .filter((r) => r.b > windowStart && r.a < windowEnd)
      .sort((x, y) => x.a - y.a);
    let cursor = windowStart;
    for (const r of spans) {
      if (r.a > cursor) issues.push({ kind: "gap", day, start: cursor - day * 1440, end: r.a - day * 1440 });
      cursor = Math.max(cursor, r.b);
      if (cursor >= windowEnd) break;
    }
    if (cursor < windowEnd) issues.push({ kind: "gap", day, start: cursor - day * 1440, end: rules.coverage.end });
  }

  return issues;
}

export function minutesLabel(m: number) {
  const h = Math.floor((m % 1440) / 60);
  const min = m % 60;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

export const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** The week as an iCalendar file. `weekStart` is the Monday, local midnight. */
export function toICS(shifts: Shift[], people: Person[], weekStart: Date): string {
  const names = new Map(people.map((p) => [p.id, p.name]));
  const stamp = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ravinojuwono.com//Shift//EN",
    "CALSCALE:GREGORIAN",
  ];
  const now = stamp(new Date());
  for (const s of shifts) {
    const start = new Date(weekStart.getTime() + (s.day * 1440 + s.start) * 60_000);
    const end = new Date(weekStart.getTime() + (s.day * 1440 + s.end) * 60_000);
    lines.push(
      "BEGIN:VEVENT",
      `UID:${s.id}@ravinojuwono.com`,
      `DTSTAMP:${now}`,
      `DTSTART:${stamp(start)}`,
      `DTEND:${stamp(end)}`,
      `SUMMARY:${escapeICS(names.get(s.personId) ?? "Shift")}`,
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}

function escapeICS(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

/** Overlap helper for the board's drag preview. */
export function overlaps(a: Shift, b: Shift) {
  return a.personId === b.personId && abs(a).a < abs(b).b && abs(b).a < abs(a).b;
}
