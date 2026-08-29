import type { Absence } from "./schedule";
import { addDays, dayNumber, formatDate, isIsoDate, parseDate } from "./workdays";

/**
 * Physical presence for a Canadian citizenship application.
 *
 * The rule: 1,095 days of physical presence inside the five years immediately
 * before the day you apply. Days as a permanent resident count in full. Days
 * in Canada as a temporary resident or protected person before PR count as a
 * half day each, capped at 365 days of credit.
 *
 * IRCC counts both the day you leave and the day you come back as days inside
 * Canada, so an absence only removes the days strictly between those two.
 */

export const REQUIRED_DAYS = 1095;
export const MAX_PRE_PR_CREDIT = 365;
/** Length of the look-back window, in days. Five years including a leap day. */
const WINDOW_DAYS = 1826;

export type Breakdown = {
  applicationDate: string;
  windowStart: string;
  /** Whole days present as a PR inside the window. */
  prDays: number;
  /** Whole days present before PR inside the window. */
  prePrDays: number;
  /** Half day credit for those, after the 365 day cap. */
  prePrCredit: number;
  /** Days lost to travel inside the window, split by side of the PR date. */
  absentBeforePr: number;
  absentAfterPr: number;
  total: number;
  meetsRequirement: boolean;
  shortfall: number;
};

function clampRange(
  fromIso: string,
  toIso: string,
  lowIso: string,
  highIso: string,
): number {
  const from = Math.max(dayNumber(fromIso), dayNumber(lowIso));
  const to = Math.min(dayNumber(toIso), dayNumber(highIso));
  return Math.max(0, to - from + 1);
}

/**
 * Days strictly between departure and return, intersected with a window.
 * Returns 0 for a same day or overnight trip, matching how IRCC counts.
 */
function absentDaysWithin(
  absence: Absence,
  lowIso: string,
  highIso: string,
): number {
  if (!isIsoDate(absence.from) || !isIsoDate(absence.to)) return 0;
  const first = dayNumber(absence.from) + 1;
  const last = dayNumber(absence.to) - 1;
  if (last < first) return 0;

  const low = Math.max(first, dayNumber(lowIso));
  const high = Math.min(last, dayNumber(highIso));
  return Math.max(0, high - low + 1);
}

export function computeBreakdown(
  applicationDate: string,
  prDate: string,
  absences: Absence[],
): Breakdown | null {
  if (!isIsoDate(applicationDate) || !isIsoDate(prDate)) return null;

  const windowStart = formatDate(
    addDays(parseDate(applicationDate), -(WINDOW_DAYS - 1)),
  );
  if (dayNumber(applicationDate) < dayNumber(windowStart)) return null;

  // The window splits at the PR date: everything from prDate onwards counts in
  // full, everything before it is eligible for the half day credit.
  const dayBeforePr = formatDate(addDays(parseDate(prDate), -1));

  const prSpanStart =
    dayNumber(prDate) > dayNumber(windowStart) ? prDate : windowStart;
  const rawPrDays =
    dayNumber(applicationDate) >= dayNumber(prSpanStart)
      ? clampRange(prSpanStart, applicationDate, windowStart, applicationDate)
      : 0;

  const rawPrePrDays =
    dayNumber(dayBeforePr) >= dayNumber(windowStart)
      ? clampRange(windowStart, dayBeforePr, windowStart, applicationDate)
      : 0;

  let absentAfterPr = 0;
  let absentBeforePr = 0;
  for (const absence of absences) {
    absentAfterPr += absentDaysWithin(absence, prSpanStart, applicationDate);
    if (dayNumber(dayBeforePr) >= dayNumber(windowStart)) {
      absentBeforePr += absentDaysWithin(absence, windowStart, dayBeforePr);
    }
  }

  const prDays = Math.max(0, rawPrDays - absentAfterPr);
  const prePrDays = Math.max(0, rawPrePrDays - absentBeforePr);
  const prePrCredit = Math.min(MAX_PRE_PR_CREDIT, Math.floor(prePrDays / 2));
  const total = prDays + prePrCredit;

  return {
    applicationDate,
    windowStart,
    prDays,
    prePrDays,
    prePrCredit,
    absentBeforePr,
    absentAfterPr,
    total,
    meetsRequirement: total >= REQUIRED_DAYS,
    shortfall: Math.max(0, REQUIRED_DAYS - total),
  };
}

/**
 * The first day the requirement is met, found by binary search over candidate
 * application dates. Returns null if it is not reachable within ten years,
 * which would mean the absences are eating days faster than they accrue.
 */
export function earliestEligibleDate(
  fromIso: string,
  prDate: string,
  absences: Absence[],
): string | null {
  if (!isIsoDate(fromIso) || !isIsoDate(prDate)) return null;

  const meets = (offset: number) => {
    const candidate = formatDate(addDays(parseDate(fromIso), offset));
    return computeBreakdown(candidate, prDate, absences)?.meetsRequirement ?? false;
  };

  let low = 0;
  let high = 3653;
  if (meets(low)) return fromIso;
  if (!meets(high)) return null;

  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (meets(mid)) high = mid;
    else low = mid + 1;
  }
  return formatDate(addDays(parseDate(fromIso), low));
}

export function overlaps(a: Absence, b: Absence): boolean {
  return (
    dayNumber(a.from) <= dayNumber(b.to) && dayNumber(b.from) <= dayNumber(a.to)
  );
}

/** Human readable length of a trip, in days spent outside Canada. */
export function absentDayCount(absence: Absence): number {
  return absentDaysWithin(absence, "1900-01-01", "2999-12-31");
}
