"use client";

import * as React from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { presence, progress } from "./film-state";
import { AMBER, INK, TEAL, damp, ease, useStage } from "./scene-utils";

/**
 * Off the clock, shown rather than said.
 *
 * Left: a sheet of ice seen from the stands. Boards, a centre line, two
 * face-off circles, and a puck that keeps ricocheting off the boards with an
 * amber trail, the only warm thing on the page.
 *
 * Right: a tower. Floors of glass stacked into the dark, each one lit from
 * the one above, slowly turning, with a single bright point at the top.
 * No cover art, no words: anyone who knows, knows.
 */

const RINK_W = 1.7;
const RINK_D = 0.95;
const PUCK_R = 0.034;
const TRAIL = 70;
const FLOORS = 13;

function Rink() {
  const puck = React.useRef<THREE.Mesh>(null);
  const trailGeometry = React.useRef<THREE.BufferGeometry>(null);
  const state = React.useRef({
    x: -0.4, z: 0.1, vx: 0.9, vz: 0.55,
    trail: new Float32Array(TRAIL * 3), head: 0, filled: 0,
  });
  const segments = React.useMemo(() => new Float32Array((TRAIL - 1) * 2 * 3), []);

  useFrame((_, delta) => {
    const s = state.current;
    const dt = Math.min(delta, 0.05);
    const limitX = RINK_W / 2 - PUCK_R - 0.02;
    const limitZ = RINK_D / 2 - PUCK_R - 0.02;
    s.x += s.vx * dt;
    s.z += s.vz * dt;
    if (s.x > limitX) { s.x = limitX; s.vx = -Math.abs(s.vx); }
    if (s.x < -limitX) { s.x = -limitX; s.vx = Math.abs(s.vx); }
    if (s.z > limitZ) { s.z = limitZ; s.vz = -Math.abs(s.vz); }
    if (s.z < -limitZ) { s.z = -limitZ; s.vz = Math.abs(s.vz); }
    if (puck.current) puck.current.position.set(s.x, 0.012, s.z);

    const base = s.head * 3;
    s.trail[base] = s.x; s.trail[base + 1] = 0.008; s.trail[base + 2] = s.z;
    s.head = (s.head + 1) % TRAIL;
    s.filled = Math.min(TRAIL, s.filled + 1);

    const geometry = trailGeometry.current;
    if (geometry) {
      const array = geometry.attributes.position!.array as Float32Array;
      let k = 0;
      for (let t = 0; t < s.filled - 1; t++) {
        const a = ((s.head + t) % TRAIL) * 3;
        const b = ((s.head + t + 1) % TRAIL) * 3;
        array[k++] = s.trail[a]!; array[k++] = s.trail[a + 1]!; array[k++] = s.trail[a + 2]!;
        array[k++] = s.trail[b]!; array[k++] = s.trail[b + 1]!; array[k++] = s.trail[b + 2]!;
      }
      geometry.setDrawRange(0, k / 3);
      geometry.attributes.position!.needsUpdate = true;
    }
  });

  const boardH = 0.07;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[RINK_W, RINK_D]} />
        <meshStandardMaterial color="#0e151d" roughness={0.25} metalness={0.4} />
      </mesh>
      {/* Centre line and two face-off circles. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <planeGeometry args={[0.012, RINK_D]} />
        <meshBasicMaterial color={AMBER} transparent opacity={0.7} />
      </mesh>
      {[-0.5, 0.5].map((x) => (
        <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.002, 0]}>
          <ringGeometry args={[0.15, 0.158, 48]} />
          <meshBasicMaterial color={TEAL} transparent opacity={0.45} />
        </mesh>
      ))}
      {/* Boards. */}
      {[
        [0, RINK_D / 2, RINK_W + 0.04, 0.02],
        [0, -RINK_D / 2, RINK_W + 0.04, 0.02],
      ].map(([x, z, w, d]) => (
        <mesh key={`${x}${z}`} position={[x!, boardH / 2, z!]}>
          <boxGeometry args={[w!, boardH, d!]} />
          <meshStandardMaterial color="#1a2230" roughness={0.6} />
        </mesh>
      ))}
      {[RINK_W / 2, -RINK_W / 2].map((x) => (
        <mesh key={x} position={[x, boardH / 2, 0]}>
          <boxGeometry args={[0.02, boardH, RINK_D + 0.04]} />
          <meshStandardMaterial color="#1a2230" roughness={0.6} />
        </mesh>
      ))}
      <mesh ref={puck} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[PUCK_R, PUCK_R, 0.014, 32]} />
        <meshStandardMaterial color="#05070a" roughness={0.35} metalness={0.2} />
      </mesh>
      <lineSegments>
        <bufferGeometry ref={trailGeometry}>
          <bufferAttribute attach="attributes-position" args={[segments, 3]} usage={THREE.DynamicDrawUsage} />
        </bufferGeometry>
        <lineBasicMaterial color={AMBER} transparent opacity={0.8} />
      </lineSegments>
    </group>
  );
}

function Tower() {
  const group = React.useRef<THREE.Group>(null);
  const floors = React.useRef<THREE.Group>(null);
  useFrame(({ clock }, delta) => {
    if (group.current) group.current.rotation.y += Math.min(delta, 0.05) * 0.25;
    const stack = floors.current;
    if (!stack) return;
    const rise = progress["off-the-clock"];
    const built = rise.enter * 0.7 + rise.pin * 0.9;
    stack.children.forEach((floor, i) => {
      const local = ease((built - i * 0.06) / 0.35);
      const y = i * 0.11;
      floor.position.y = y - (1 - local) * 0.3;
      floor.scale.setScalar(Math.max(0.0001, local));
      const light = floor.children[1] as THREE.Mesh | undefined;
      if (light) {
        const material = light.material as THREE.MeshBasicMaterial;
        material.opacity = 0.35 + 0.35 * Math.sin(clock.elapsedTime * 1.2 + i * 0.8) * local;
      }
    });
  });

  return (
    <group ref={group}>
      <group ref={floors}>
        {Array.from({ length: FLOORS }, (_, i) => {
          const size = 0.62 - i * 0.03;
          return (
            <group key={i}>
              <mesh>
                <boxGeometry args={[size, 0.045, size]} />
                <meshStandardMaterial
                  color="#16202c"
                  emissive={TEAL}
                  emissiveIntensity={0.08}
                  transparent
                  opacity={0.72}
                  roughness={0.2}
                  metalness={0.3}
                />
              </mesh>
              <mesh position={[0, -0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[size * 0.92, size * 0.92]} />
                <meshBasicMaterial color={TEAL} transparent opacity={0.4} side={THREE.DoubleSide} />
              </mesh>
            </group>
          );
        })}
      </group>
      <mesh position={[0, FLOORS * 0.11 + 0.05, 0]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshBasicMaterial color={INK} />
      </mesh>
    </group>
  );
}

export function OffClockScene() {
  const group = React.useRef<THREE.Group>(null);
  const rink = React.useRef<THREE.Group>(null);
  const tower = React.useRef<THREE.Group>(null);
  const { narrow, halfW } = useStage();
  const smooth = React.useRef({ on: 0 });

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const dt = Math.min(delta, 0.05);
    const on = presence("off-the-clock");
    smooth.current.on = damp(smooth.current.on, on, 8, dt);
    g.visible = smooth.current.on > 0.001;
    if (!g.visible) return;

    const p = progress["off-the-clock"];
    const enter = ease(p.enter);
    const leave = ease(p.exit);
    g.position.y = (1 - enter) * -0.5 + leave * 0.9;

    if (rink.current) {
      rink.current.position.set(narrow ? -0.28 : -halfW * 0.45, narrow ? 0.55 : 0.28, 0);
      rink.current.scale.setScalar(narrow ? 0.42 : 0.85);
      rink.current.rotation.set(0.95, -0.15 + p.pin * 0.1, 0.05);
    }
    if (tower.current) {
      tower.current.position.set(narrow ? 0.42 : halfW * 0.5, narrow ? 0.2 : -0.6, 0);
      tower.current.scale.setScalar(narrow ? 0.5 : 0.95);
    }
  });

  return (
    <group ref={group} visible={false}>
      <group ref={rink}>
        <Rink />
      </group>
      <group ref={tower}>
        <Tower />
      </group>
    </group>
  );
}
