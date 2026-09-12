import * as THREE from "three";
import { useThree } from "@react-three/fiber";

export const DEG = Math.PI / 180;
/** The one camera every scene shares: fixed at z = 3.2 looking down -z. */
export const CAMERA_Z = 3.2;
export const FOV = 38;
/** Half the visible height at z = 0, in world units. */
export const HALF_HEIGHT = Math.tan((FOV / 2) * DEG) * CAMERA_Z;

/** Viewport measurements in world units at z = 0. */
export function useStage() {
  const { size } = useThree();
  const aspect = size.width / size.height;
  return {
    aspect,
    /** Phone-shaped: text sits low, visuals go up top and get smaller. */
    narrow: aspect < 0.8,
    halfW: HALF_HEIGHT * aspect,
    halfH: HALF_HEIGHT,
  };
}

export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
/** Smoothstep. */
export const ease = (t: number) => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};
/** Eased 0..1 as `t` runs from `from` to `to`. */
export const span = (t: number, from: number, to: number) =>
  ease((t - from) / (to - from));
/** Frame-rate independent approach, in place of a lerp. */
export const damp = (current: number, target: number, speed: number, dt: number) =>
  THREE.MathUtils.damp(current, target, speed, dt);

/** Small deterministic PRNG so every scene plays the same on every load. */
export function makeRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export const TEAL = "#5fd3e6";
export const AMBER = "#f2a65a";
export const INK = "#e8ecf1";
export const SURFACE = "#11161e";
export const SURFACE_2 = "#171d27";
