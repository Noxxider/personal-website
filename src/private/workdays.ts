/**
 * Date helpers shared by the private tools. Everything works in UTC on
 * YYYY-MM-DD strings so the day of the week never shifts with the viewer's
 * timezone. No personal data lives here, so this is safe on the client.
 */

export const MS_PER_DAY = 86_400_000;

export function parseDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1));
}

export function formatDate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(date: Date, n: number): Date {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + n);
  return next;
}

export function dayNumber(iso: string): number {
  return Math.floor(parseDate(iso).getTime() / MS_PER_DAY);
}

export function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

/** Today in Pacific time, plus the current hour there. */
export function pacificNow(): { date: string; hour: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Vancouver",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const map: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== "literal") map[part.type] = part.value;
  }
  // Intl reports midnight as hour 24 in some engines.
  const hour = Number(map["hour"] ?? "0") % 24;
  return { date: `${map["year"]}-${map["month"]}-${map["day"]}`, hour };
}

export function prettyDate(iso: string): string {
  return parseDate(iso).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** Weekdays between two dates inclusive, ignoring holidays and leave. */
export function countWeekdays(startIso: string, endIso: string): number {
  if (!isIsoDate(startIso) || !isIsoDate(endIso)) return 0;
  const end = parseDate(endIso);
  let cursor = parseDate(startIso);
  if (end < cursor) return 0;

  let count = 0;
  for (let guard = 0; cursor <= end && guard < 20_000; guard++) {
    const weekday = cursor.getUTCDay();
    if (weekday >= 1 && weekday <= 5) count++;
    cursor = addDays(cursor, 1);
  }
  return count;
}

/** The last weekday on or before `endIso`, starting the scan at `startIso`. */
export function lastWeekdayBefore(startIso: string, endIso: string): string | null {
  if (!isIsoDate(startIso) || !isIsoDate(endIso)) return null;
  const end = parseDate(endIso);
  let cursor = parseDate(startIso);
  let last: string | null = null;
  for (let guard = 0; cursor <= end && guard < 20_000; guard++) {
    const weekday = cursor.getUTCDay();
    if (weekday >= 1 && weekday <= 5) last = formatDate(cursor);
    cursor = addDays(cursor, 1);
  }
  return last;
}
