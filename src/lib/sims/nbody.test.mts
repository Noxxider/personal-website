import { test } from "node:test";
import assert from "node:assert/strict";
import { createSystem, drift, energy, stepEuler, stepVerlet } from "./nbody.ts";

const DT = 0.004;
const STEPS = 20_000;

test("velocity Verlet keeps the energy drift bounded", () => {
  const s = createSystem(5, 1919);
  const e0 = energy(s);
  let worst = 0;
  for (let i = 0; i < STEPS; i++) {
    stepVerlet(s, DT);
    worst = Math.max(worst, Math.abs(drift(e0, energy(s))));
  }
  assert.ok(worst < 0.02, `Verlet drifted by ${worst}`);
});

test("forward Euler drifts far more than Verlet at the same step", () => {
  const euler = createSystem(5, 1919);
  const verlet = createSystem(5, 1919);
  const e0 = energy(euler);
  for (let i = 0; i < STEPS; i++) {
    stepEuler(euler, DT);
    stepVerlet(verlet, DT);
  }
  const eulerDrift = Math.abs(drift(e0, energy(euler)));
  const verletDrift = Math.abs(drift(e0, energy(verlet)));
  assert.ok(eulerDrift > verletDrift * 5, `Euler ${eulerDrift} vs Verlet ${verletDrift}`);
});

test("the same seed gives the same system", () => {
  const a = createSystem(5, 42);
  const b = createSystem(5, 42);
  assert.deepEqual(Array.from(a.pos), Array.from(b.pos));
});
