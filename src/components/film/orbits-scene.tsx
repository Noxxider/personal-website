"use client";

import * as React from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { pointer, presence, progress } from "./film-state";
import { INK, TEAL, damp, ease, makeRandom, useStage } from "./scene-utils";

/**
 * The physics chapter: a real gravitational N-body integrator, velocity
 * Verlet with softening, five bodies and their trails. Deterministic seed,
 * so it plays the same for everyone. The pointer adds a gentle pull, which
 * is enough to feel that it is a simulation and not a video.
 */

const BODIES = 5;
const TRAIL = 140;
const G = 1.0;
const SOFTENING = 0.02;
const SUBSTEPS = 4;
const DT = 0.004;

type Sim = {
  pos: Float32Array;
  vel: Float32Array;
  acc: Float32Array;
  mass: Float32Array;
  trails: Float32Array;
  head: number;
  filled: number;
};

function createSim(): Sim {
  const random = makeRandom(1919);
  const pos = new Float32Array(BODIES * 3);
  const vel = new Float32Array(BODIES * 3);
  const mass = new Float32Array(BODIES);
  mass[0] = 1.0;
  for (let i = 1; i < BODIES; i++) {
    const r = 0.32 + i * 0.16 + random() * 0.05;
    const angle = random() * Math.PI * 2;
    const tilt = (random() - 0.5) * 0.35;
    pos[i * 3] = r * Math.cos(angle);
    pos[i * 3 + 1] = r * Math.sin(angle) * Math.sin(tilt);
    pos[i * 3 + 2] = r * Math.sin(angle) * Math.cos(tilt);
    const v = Math.sqrt((G * mass[0]!) / r) * (0.92 + random() * 0.12);
    vel[i * 3] = -v * Math.sin(angle);
    vel[i * 3 + 1] = v * Math.cos(angle) * Math.sin(tilt);
    vel[i * 3 + 2] = v * Math.cos(angle) * Math.cos(tilt);
    mass[i] = 0.004 + random() * 0.012;
  }
  return {
    pos,
    vel,
    acc: new Float32Array(BODIES * 3),
    mass,
    trails: new Float32Array(BODIES * TRAIL * 3),
    head: 0,
    filled: 0,
  };
}

function accelerate(sim: Sim, pull: THREE.Vector3 | null) {
  const { pos, acc, mass } = sim;
  acc.fill(0);
  for (let i = 0; i < BODIES; i++) {
    for (let j = i + 1; j < BODIES; j++) {
      const dx = pos[j * 3]! - pos[i * 3]!;
      const dy = pos[j * 3 + 1]! - pos[i * 3 + 1]!;
      const dz = pos[j * 3 + 2]! - pos[i * 3 + 2]!;
      const d2 = dx * dx + dy * dy + dz * dz + SOFTENING * SOFTENING;
      const inv = 1 / (Math.sqrt(d2) * d2);
      const fi = G * mass[j]! * inv;
      const fj = G * mass[i]! * inv;
      acc[i * 3] = acc[i * 3]! + dx * fi; acc[i * 3 + 1] = acc[i * 3 + 1]! + dy * fi; acc[i * 3 + 2] = acc[i * 3 + 2]! + dz * fi;
      acc[j * 3] = acc[j * 3]! - dx * fj; acc[j * 3 + 1] = acc[j * 3 + 1]! - dy * fj; acc[j * 3 + 2] = acc[j * 3 + 2]! - dz * fj;
    }
    if (pull) {
      const dx = pull.x - pos[i * 3]!;
      const dy = pull.y - pos[i * 3 + 1]!;
      const dz = -pos[i * 3 + 2]!;
      const d2 = dx * dx + dy * dy + dz * dz + 0.2;
      const f = 0.25 / d2;
      acc[i * 3] = acc[i * 3]! + dx * f; acc[i * 3 + 1] = acc[i * 3 + 1]! + dy * f; acc[i * 3 + 2] = acc[i * 3 + 2]! + dz * f;
    }
  }
}

function step(sim: Sim, pull: THREE.Vector3 | null) {
  const { pos, vel, acc } = sim;
  for (let s = 0; s < SUBSTEPS; s++) {
    for (let i = 0; i < BODIES * 3; i++) {
      vel[i]! += 0.5 * acc[i]! * DT;
      pos[i]! += vel[i]! * DT;
    }
    accelerate(sim, pull);
    for (let i = 0; i < BODIES * 3; i++) vel[i]! += 0.5 * acc[i]! * DT;
  }
  // Keep the central body pinned near the origin so the picture stays put.
  pos[0] = pos[0]! * 0.98; pos[1] = pos[1]! * 0.98; pos[2] = pos[2]! * 0.98;
}

export function OrbitsScene() {
  const group = React.useRef<THREE.Group>(null);
  const bodies = React.useRef<THREE.InstancedMesh>(null);
  const trailGeometry = React.useRef<THREE.BufferGeometry>(null);
  const trailMaterial = React.useRef<THREE.LineBasicMaterial>(null);
  const sim = React.useRef<Sim | null>(null);
  if (sim.current === null) sim.current = createSim();
  const { narrow, halfW } = useStage();
  const smooth = React.useRef({ on: 0 });
  const dummy = React.useMemo(() => new THREE.Object3D(), []);
  const pull = React.useMemo(() => new THREE.Vector3(), []);
  const trailSegments = React.useMemo(
    () => new Float32Array(BODIES * (TRAIL - 1) * 2 * 3),
    [],
  );

  useFrame((_, delta) => {
    const g = group.current;
    const mesh = bodies.current;
    const s = sim.current;
    if (!g || !mesh || !s) return;
    const dt = Math.min(delta, 0.05);

    const on = presence("physics");
    smooth.current.on = damp(smooth.current.on, on, 8, dt);
    g.visible = smooth.current.on > 0.001;
    if (!g.visible) return;

    // The pointer, in the scene's own frame, as a soft extra mass.
    const usePull = pointer.active && !narrow;
    let pullVector: THREE.Vector3 | null = null;
    if (usePull) {
      const px = pointer.x * halfW - g.position.x;
      const py = pointer.y * 1.1 - g.position.y;
      pullVector = pull.set(px / g.scale.x, py / g.scale.y, 0);
    }
    step(s, pullVector);

    for (let i = 0; i < BODIES; i++) {
      dummy.position.set(s.pos[i * 3]!, s.pos[i * 3 + 1]!, s.pos[i * 3 + 2]!);
      dummy.scale.setScalar(i === 0 ? 0.075 : 0.022 + s.mass[i]! * 1.2);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      // Ring buffer of past positions per body.
      const base = (i * TRAIL + s.head) * 3;
      s.trails[base] = s.pos[i * 3]!;
      s.trails[base + 1] = s.pos[i * 3 + 1]!;
      s.trails[base + 2] = s.pos[i * 3 + 2]!;
    }
    mesh.instanceMatrix.needsUpdate = true;
    s.head = (s.head + 1) % TRAIL;
    s.filled = Math.min(TRAIL, s.filled + 1);

    // Unroll the ring buffers into line segments, oldest to newest.
    const geometry = trailGeometry.current;
    if (geometry) {
      const array = geometry.attributes.position!.array as Float32Array;
      let k = 0;
      for (let i = 0; i < BODIES; i++) {
        for (let t = 0; t < s.filled - 1; t++) {
          const a = (i * TRAIL + ((s.head + t) % TRAIL)) * 3;
          const b = (i * TRAIL + ((s.head + t + 1) % TRAIL)) * 3;
          array[k++] = s.trails[a]!; array[k++] = s.trails[a + 1]!; array[k++] = s.trails[a + 2]!;
          array[k++] = s.trails[b]!; array[k++] = s.trails[b + 1]!; array[k++] = s.trails[b + 2]!;
        }
      }
      geometry.setDrawRange(0, k / 3);
      geometry.attributes.position!.needsUpdate = true;
    }

    const p = progress.physics;
    const enter = ease(p.enter);
    const leave = ease(p.exit);
    const base = narrow
      ? { x: 0.1, y: 0.8, s: 0.42 }
      : { x: Math.min(0.95, halfW - 0.85), y: 0.3, s: 0.68 };
    g.position.set(base.x, base.y + (1 - enter) * -0.6 + leave * 0.8, 0);
    g.scale.setScalar(base.s * (0.6 + 0.4 * enter) * (1 - leave * 0.5));
    g.rotation.set(0.55, p.pin * 0.4 - 0.2, 0);
    if (trailMaterial.current) trailMaterial.current.opacity = 0.55 * smooth.current.on;
  });

  return (
    <group ref={group} visible={false}>
      <instancedMesh ref={bodies} args={[undefined, undefined, BODIES]}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial color={INK} />
      </instancedMesh>
      <lineSegments>
        <bufferGeometry ref={trailGeometry}>
          <bufferAttribute
            attach="attributes-position"
            args={[trailSegments, 3]}
            usage={THREE.DynamicDrawUsage}
          />
        </bufferGeometry>
        <lineBasicMaterial ref={trailMaterial} color={TEAL} transparent opacity={0.55} />
      </lineSegments>
    </group>
  );
}
