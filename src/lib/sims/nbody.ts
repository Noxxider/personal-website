/**
 * Gravitational N-body integration, kept free of any rendering so it can be
 * unit tested and reused by the front-page chapter and the /work/orbits lab.
 *
 * Units are arbitrary: G = 1, the central mass is 1, distances are of order
 * one. Softening keeps close passes from blowing up.
 */

export type System = {
  n: number;
  pos: Float64Array;
  vel: Float64Array;
  acc: Float64Array;
  mass: Float64Array;
  softening: number;
};

export type Integrator = "euler" | "verlet";

/** Small deterministic PRNG so a seed always produces the same system. */
export function makeRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/** A heavy central body and `n - 1` lighter ones on roughly circular orbits. */
export function createSystem(n = 5, seed = 1919, centralMass = 1): System {
  const random = makeRandom(seed);
  const pos = new Float64Array(n * 3);
  const vel = new Float64Array(n * 3);
  const mass = new Float64Array(n);
  mass[0] = centralMass;
  for (let i = 1; i < n; i++) {
    const r = 0.35 + i * 0.16 + random() * 0.05;
    const angle = random() * Math.PI * 2;
    const tilt = (random() - 0.5) * 0.3;
    pos[i * 3] = r * Math.cos(angle);
    pos[i * 3 + 1] = r * Math.sin(angle) * Math.sin(tilt);
    pos[i * 3 + 2] = r * Math.sin(angle) * Math.cos(tilt);
    const v = Math.sqrt(centralMass / r) * (0.95 + random() * 0.08);
    vel[i * 3] = -v * Math.sin(angle);
    vel[i * 3 + 1] = v * Math.cos(angle) * Math.sin(tilt);
    vel[i * 3 + 2] = v * Math.cos(angle) * Math.cos(tilt);
    mass[i] = 0.003 + random() * 0.01;
  }
  const system: System = { n, pos, vel, acc: new Float64Array(n * 3), mass, softening: 0.02 };
  accelerate(system);
  return system;
}

export function accelerate(s: System, pull?: { x: number; y: number; z: number; mass: number }) {
  const { n, pos, acc, mass, softening } = s;
  acc.fill(0);
  const eps2 = softening * softening;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const dx = pos[j * 3]! - pos[i * 3]!;
      const dy = pos[j * 3 + 1]! - pos[i * 3 + 1]!;
      const dz = pos[j * 3 + 2]! - pos[i * 3 + 2]!;
      const d2 = dx * dx + dy * dy + dz * dz + eps2;
      const inv = 1 / (Math.sqrt(d2) * d2);
      const fi = mass[j]! * inv;
      const fj = mass[i]! * inv;
      acc[i * 3] = acc[i * 3]! + dx * fi;
      acc[i * 3 + 1] = acc[i * 3 + 1]! + dy * fi;
      acc[i * 3 + 2] = acc[i * 3 + 2]! + dz * fi;
      acc[j * 3] = acc[j * 3]! - dx * fj;
      acc[j * 3 + 1] = acc[j * 3 + 1]! - dy * fj;
      acc[j * 3 + 2] = acc[j * 3 + 2]! - dz * fj;
    }
    if (pull) {
      const dx = pull.x - pos[i * 3]!;
      const dy = pull.y - pos[i * 3 + 1]!;
      const dz = pull.z - pos[i * 3 + 2]!;
      const d2 = dx * dx + dy * dy + dz * dz + 0.05;
      const f = pull.mass / (Math.sqrt(d2) * d2);
      acc[i * 3] = acc[i * 3]! + dx * f;
      acc[i * 3 + 1] = acc[i * 3 + 1]! + dy * f;
      acc[i * 3 + 2] = acc[i * 3 + 2]! + dz * f;
    }
  }
}

/** Forward Euler: simple, and it leaks energy every step. Shown for contrast. */
export function stepEuler(s: System, dt: number, pull?: Parameters<typeof accelerate>[1]) {
  const { n, pos, vel, acc } = s;
  accelerate(s, pull);
  for (let i = 0; i < n * 3; i++) {
    pos[i] = pos[i]! + vel[i]! * dt;
    vel[i] = vel[i]! + acc[i]! * dt;
  }
}

/** Velocity Verlet: symplectic, so the energy error stays bounded. */
export function stepVerlet(s: System, dt: number, pull?: Parameters<typeof accelerate>[1]) {
  const { n, pos, vel, acc } = s;
  for (let i = 0; i < n * 3; i++) {
    vel[i] = vel[i]! + 0.5 * acc[i]! * dt;
    pos[i] = pos[i]! + vel[i]! * dt;
  }
  accelerate(s, pull);
  for (let i = 0; i < n * 3; i++) vel[i] = vel[i]! + 0.5 * acc[i]! * dt;
}

export function step(s: System, integrator: Integrator, dt: number, pull?: Parameters<typeof accelerate>[1]) {
  if (integrator === "euler") stepEuler(s, dt, pull);
  else stepVerlet(s, dt, pull);
}

/** Total mechanical energy: kinetic plus (softened) pairwise potential. */
export function energy(s: System): number {
  const { n, pos, vel, mass, softening } = s;
  let kinetic = 0;
  let potential = 0;
  for (let i = 0; i < n; i++) {
    const vx = vel[i * 3]!, vy = vel[i * 3 + 1]!, vz = vel[i * 3 + 2]!;
    kinetic += 0.5 * mass[i]! * (vx * vx + vy * vy + vz * vz);
    for (let j = i + 1; j < n; j++) {
      const dx = pos[j * 3]! - pos[i * 3]!;
      const dy = pos[j * 3 + 1]! - pos[i * 3 + 1]!;
      const dz = pos[j * 3 + 2]! - pos[i * 3 + 2]!;
      potential -= (mass[i]! * mass[j]!) / Math.sqrt(dx * dx + dy * dy + dz * dz + softening * softening);
    }
  }
  return kinetic + potential;
}

/** Relative energy drift since `e0`, as a fraction. */
export function drift(e0: number, e: number): number {
  return Math.abs(e0) > 1e-12 ? (e - e0) / Math.abs(e0) : 0;
}
