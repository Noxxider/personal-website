/**
 * The double pendulum: two rigid rods, two point masses, gravity. State is
 * [theta1, omega1, theta2, omega2], angles from the downward vertical.
 * Integrated with classical fourth-order Runge–Kutta at a fixed step.
 */

export type PendulumState = [number, number, number, number];

export type PendulumParams = {
  m1: number;
  m2: number;
  l1: number;
  l2: number;
  g: number;
};

export const DEFAULT_PARAMS: PendulumParams = { m1: 1, m2: 1, l1: 1, l2: 1, g: 9.81 };

export function derivatives(
  [t1, w1, t2, w2]: PendulumState,
  { m1, m2, l1, l2, g }: PendulumParams,
): PendulumState {
  const delta = t1 - t2;
  const sinD = Math.sin(delta);
  const cosD = Math.cos(delta);
  const den = 2 * m1 + m2 - m2 * Math.cos(2 * delta);

  const a1 =
    (-g * (2 * m1 + m2) * Math.sin(t1) -
      m2 * g * Math.sin(t1 - 2 * t2) -
      2 * sinD * m2 * (w2 * w2 * l2 + w1 * w1 * l1 * cosD)) /
    (l1 * den);

  const a2 =
    (2 * sinD * (w1 * w1 * l1 * (m1 + m2) + g * (m1 + m2) * Math.cos(t1) + w2 * w2 * l2 * m2 * cosD)) /
    (l2 * den);

  return [w1, a1, w2, a2];
}

export function stepRK4(state: PendulumState, dt: number, params = DEFAULT_PARAMS): PendulumState {
  const k1 = derivatives(state, params);
  const k2 = derivatives(add(state, k1, dt / 2), params);
  const k3 = derivatives(add(state, k2, dt / 2), params);
  const k4 = derivatives(add(state, k3, dt), params);
  return [
    state[0] + (dt / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]),
    state[1] + (dt / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]),
    state[2] + (dt / 6) * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]),
    state[3] + (dt / 6) * (k1[3] + 2 * k2[3] + 2 * k3[3] + k4[3]),
  ];
}

function add(s: PendulumState, d: PendulumState, h: number): PendulumState {
  return [s[0] + d[0] * h, s[1] + d[1] * h, s[2] + d[2] * h, s[3] + d[3] * h];
}

/** Positions of the two bobs, origin at the pivot, y down. */
export function positions([t1, , t2]: PendulumState, { l1, l2 }: PendulumParams = DEFAULT_PARAMS) {
  const x1 = l1 * Math.sin(t1);
  const y1 = l1 * Math.cos(t1);
  return { x1, y1, x2: x1 + l2 * Math.sin(t2), y2: y1 + l2 * Math.cos(t2) };
}

/** Total mechanical energy, for checking the integrator rather than showing off. */
export function energy([t1, w1, t2, w2]: PendulumState, { m1, m2, l1, l2, g }: PendulumParams = DEFAULT_PARAMS) {
  const kinetic =
    0.5 * m1 * l1 * l1 * w1 * w1 +
    0.5 * m2 * (l1 * l1 * w1 * w1 + l2 * l2 * w2 * w2 + 2 * l1 * l2 * w1 * w2 * Math.cos(t1 - t2));
  const potential = -(m1 + m2) * g * l1 * Math.cos(t1) - m2 * g * l2 * Math.cos(t2);
  return kinetic + potential;
}

/** How far apart two states are, in angle space, ignoring full turns. */
export function divergence(a: PendulumState, b: PendulumState) {
  const wrap = (x: number) => Math.atan2(Math.sin(x), Math.cos(x));
  const d1 = wrap(a[0] - b[0]);
  const d2 = wrap(a[2] - b[2]);
  return Math.sqrt(d1 * d1 + d2 * d2);
}
