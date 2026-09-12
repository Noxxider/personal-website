import { test } from "node:test";
import assert from "node:assert/strict";
import { divergence, energy, stepRK4, type PendulumState } from "./pendulum.ts";

test("RK4 conserves energy closely at a small step", () => {
  let s: PendulumState = [Math.PI / 2, 0, Math.PI / 2, 0];
  const e0 = energy(s);
  let worst = 0;
  for (let i = 0; i < 20_000; i++) {
    s = stepRK4(s, 0.001);
    worst = Math.max(worst, Math.abs(energy(s) - e0));
  }
  assert.ok(worst < 1e-3, `energy wandered by ${worst}`);
});

test("two pendulums a thousandth of a radian apart diverge", () => {
  let a: PendulumState = [2.0, 0, 2.0, 0];
  let b: PendulumState = [2.0, 0, 2.001, 0];
  const start = divergence(a, b);
  for (let i = 0; i < 20_000; i++) {
    a = stepRK4(a, 0.001);
    b = stepRK4(b, 0.001);
  }
  assert.ok(divergence(a, b) > start * 50, `only ${divergence(a, b)} after 20 s`);
});

test("a pendulum hanging still stays still", () => {
  let s: PendulumState = [0, 0, 0, 0];
  for (let i = 0; i < 1000; i++) s = stepRK4(s, 0.01);
  assert.deepEqual(s, [0, 0, 0, 0]);
});
