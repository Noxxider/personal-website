import assert from "node:assert/strict";
import { test } from "node:test";
import {
  computeBreakdown,
  earliestEligibleDate,
  REQUIRED_DAYS,
} from "./citizenship.ts";

/**
 * The physical presence maths decides a real date on a real application, so it
 * gets tests. Run with `npm test`.
 */

const PR = "2026-05-04";
const TODAY = "2026-08-29";
const ABSENCES = [{ id: "a", from: "2025-01-02", to: "2025-01-22" }];

const daysBetween = (from: string, to: string) =>
  Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);

test("an absence only costs the days strictly between departure and return", () => {
  const b = computeBreakdown(TODAY, PR, ABSENCES)!;
  // 2 Jan to 22 Jan: both endpoints count as days in Canada, so 19 are lost.
  assert.equal(b.absentBeforePr, 19);
  assert.equal(b.absentAfterPr, 0);
});

test("same day and overnight trips cost nothing", () => {
  for (const to of ["2026-06-01", "2026-06-02"]) {
    const b = computeBreakdown(TODAY, PR, [
      { id: "t", from: "2026-06-01", to },
    ])!;
    assert.equal(b.absentAfterPr, 0);
  }
});

test("days as a permanent resident count in full", () => {
  const b = computeBreakdown(TODAY, PR, ABSENCES)!;
  assert.equal(b.prDays, daysBetween(PR, TODAY) + 1);
});

test("credit for time before PR is capped at 365", () => {
  const b = computeBreakdown(TODAY, PR, ABSENCES)!;
  assert.equal(b.prePrCredit, 365);
  assert.equal(b.total, b.prDays + 365);
});

test("eligibility lands on the first day the total reaches 1095", () => {
  const earliest = earliestEligibleDate(TODAY, PR, ABSENCES)!;
  const atTarget = computeBreakdown(earliest, PR, ABSENCES)!;
  assert.equal(atTarget.total, REQUIRED_DAYS);
  assert.equal(atTarget.meetsRequirement, true);

  const dayBefore = new Date(Date.parse(earliest) - 86_400_000)
    .toISOString()
    .slice(0, 10);
  assert.equal(computeBreakdown(dayBefore, PR, ABSENCES)!.meetsRequirement, false);
});

test("with a full pre-PR credit, eligibility is 730 PR days after landing", () => {
  const earliest = earliestEligibleDate(TODAY, PR, ABSENCES)!;
  assert.equal(daysBetween(PR, earliest) + 1, REQUIRED_DAYS - 365);
});

test("a future trip pushes eligibility back by the days it costs", () => {
  const base = earliestEligibleDate(TODAY, PR, ABSENCES)!;
  const withTrip = earliestEligibleDate(TODAY, PR, [
    ...ABSENCES,
    { id: "b", from: "2026-09-01", to: "2026-09-11" },
  ])!;
  assert.equal(daysBetween(base, withTrip), 9);
});

test("an absence outside the five year window is ignored", () => {
  const ancient = [{ id: "old", from: "2015-01-01", to: "2015-03-01" }];
  const withOld = computeBreakdown(TODAY, PR, ancient)!;
  const withNone = computeBreakdown(TODAY, PR, [])!;
  assert.equal(withOld.total, withNone.total);
});

test("a malformed date is ignored rather than throwing", () => {
  const b = computeBreakdown(TODAY, PR, [
    { id: "bad", from: "not-a-date", to: "2026-06-10" },
  ]);
  assert.ok(b !== null);
  assert.equal(b.absentAfterPr, 0);
});
