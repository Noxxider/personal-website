import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_RULES, findIssues, toICS, type Shift } from "./shift.ts";

const rules = { ...DEFAULT_RULES, coverage: { start: 9 * 60, end: 17 * 60 } };

test("two overlapping shifts for one person are an overlap", () => {
  const shifts: Shift[] = [
    { id: "a", personId: "p1", day: 0, start: 9 * 60, end: 13 * 60 },
    { id: "b", personId: "p1", day: 0, start: 12 * 60, end: 17 * 60 },
  ];
  const overlaps = findIssues(shifts, rules).filter((i) => i.kind === "overlap");
  assert.equal(overlaps.length, 1);
});

test("the same overlap for two different people is fine", () => {
  const shifts: Shift[] = [
    { id: "a", personId: "p1", day: 0, start: 9 * 60, end: 13 * 60 },
    { id: "b", personId: "p2", day: 0, start: 12 * 60, end: 17 * 60 },
  ];
  assert.equal(findIssues(shifts, rules).filter((i) => i.kind === "overlap").length, 0);
});

test("a late finish followed by an early start breaks the rest rule", () => {
  const shifts: Shift[] = [
    { id: "a", personId: "p1", day: 0, start: 14 * 60, end: 23 * 60 },
    { id: "b", personId: "p1", day: 1, start: 6 * 60, end: 14 * 60 },
  ];
  const rest = findIssues(shifts, rules).filter((i) => i.kind === "rest");
  assert.equal(rest.length, 1);
  assert.equal(rest[0]!.kind === "rest" && rest[0]!.gap, 7 * 60);
});

test("coverage gaps are reported per day, and a full day is one gap", () => {
  const shifts: Shift[] = [
    { id: "a", personId: "p1", day: 0, start: 9 * 60, end: 12 * 60 },
    { id: "b", personId: "p2", day: 0, start: 13 * 60, end: 17 * 60 },
  ];
  const gaps = findIssues(shifts, rules).filter((i) => i.kind === "gap");
  const monday = gaps.filter((g) => g.kind === "gap" && g.day === 0);
  assert.equal(monday.length, 1);
  assert.deepEqual(monday[0], { kind: "gap", day: 0, start: 12 * 60, end: 13 * 60 });
  // Six other days with nobody on at all.
  assert.equal(gaps.length - monday.length, 6);
});

test("too many weekly hours is flagged once per person", () => {
  const shifts: Shift[] = Array.from({ length: 6 }, (_, day) => ({
    id: `s${day}`, personId: "p1", day, start: 8 * 60, end: 17 * 60,
  }));
  const hours = findIssues(shifts, rules).filter((i) => i.kind === "hours");
  assert.equal(hours.length, 1);
});

test("iCalendar output has one event per shift with UTC stamps", () => {
  const shifts: Shift[] = [
    { id: "a", personId: "p1", day: 0, start: 9 * 60, end: 17 * 60 },
    { id: "b", personId: "p2", day: 4, start: 12 * 60, end: 20 * 60 },
  ];
  const ics = toICS(shifts, [{ id: "p1", name: "Ada" }, { id: "p2", name: "Grace, RN" }], new Date(Date.UTC(2026, 8, 14)));
  assert.equal((ics.match(/BEGIN:VEVENT/g) ?? []).length, 2);
  assert.match(ics, /DTSTART:20260914T090000Z/);
  assert.match(ics, /SUMMARY:Grace\\, RN/);
  assert.ok(ics.endsWith("END:VCALENDAR\r\n"));
});
