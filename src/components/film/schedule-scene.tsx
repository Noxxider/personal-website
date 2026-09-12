"use client";

import * as React from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { presence, progress } from "./film-state";
import { AMBER, TEAL, SURFACE_2, clamp01, damp, ease, makeRandom, useStage } from "./scene-utils";

/**
 * The systems chapter: a week of appointment slots as bars rising from a
 * tilted plane. Bookings fill in as the scene arrives. Partway through, one
 * booking turns amber and is re-flowed to another slot: the thing the day
 * job is actually about, done in three seconds without a caption.
 */

const COLUMNS = 7;
const ROWS = 12;
const COUNT = COLUMNS * ROWS;
const CELL = 0.13;
const GAP = 0.035;

type Slot = { height: number; booked: boolean; order: number };

const slots: Slot[] = (() => {
  const random = makeRandom(20260911);
  const out: Slot[] = [];
  for (let i = 0; i < COUNT; i++) {
    const booked = random() < 0.58;
    out.push({
      height: booked ? 0.08 + random() * 0.26 : 0.012,
      booked,
      order: random(),
    });
  }
  return out;
})();

/** The booking that moves, and where it goes. */
const FROM = 3 * ROWS + 5;
const TO = 5 * ROWS + 8;
slots[FROM] = { height: 0.3, booked: true, order: 0.3 };
slots[TO] = { height: 0.012, booked: false, order: 0.9 };

const dummy = new THREE.Object3D();
const tealColor = new THREE.Color(TEAL).multiplyScalar(0.72);
const emptyColor = new THREE.Color(SURFACE_2);
const amberColor = new THREE.Color(AMBER);
const scratch = new THREE.Color();

export function ScheduleScene() {
  const group = React.useRef<THREE.Group>(null);
  const bars = React.useRef<THREE.InstancedMesh>(null);
  const { narrow, halfW } = useStage();
  const smooth = React.useRef({ build: 0, reflow: 0, on: 0 });

  useFrame((_, delta) => {
    const g = group.current;
    const mesh = bars.current;
    if (!g || !mesh) return;
    const dt = Math.min(delta, 0.05);

    const p = progress.systems;
    const on = presence("systems");
    smooth.current.on = damp(smooth.current.on, on, 8, dt);
    g.visible = smooth.current.on > 0.001;
    if (!g.visible) return;

    // Build while sliding in and through the first third of the pin; the
    // moved booking happens in the middle of the pin.
    smooth.current.build = damp(smooth.current.build, clamp01(p.enter * 0.6 + p.pin * 1.2), 6, dt);
    smooth.current.reflow = damp(smooth.current.reflow, clamp01((p.pin - 0.4) / 0.25), 6, dt);
    const { build, reflow } = smooth.current;

    const width = COLUMNS * CELL + (COLUMNS - 1) * GAP;
    const depth = ROWS * CELL + (ROWS - 1) * GAP;
    for (let i = 0; i < COUNT; i++) {
      const column = Math.floor(i / ROWS);
      const row = i % ROWS;
      const slot = slots[i]!;
      const local = ease((build - slot.order * 0.55) / 0.45);
      let height = 0.012 + (slot.height - 0.012) * local;
      let color: THREE.Color = slot.booked ? tealColor : emptyColor;

      if (i === FROM) {
        height = 0.012 + (0.3 - 0.012) * local * (1 - ease(reflow));
        color = scratch.copy(tealColor).lerp(amberColor, ease(reflow * 2));
      } else if (i === TO) {
        height = 0.012 + (0.3 - 0.012) * ease((reflow - 0.4) / 0.6);
        color = reflow > 0.4 ? amberColor : emptyColor;
      }

      dummy.position.set(
        -width / 2 + column * (CELL + GAP) + CELL / 2,
        height / 2,
        -depth / 2 + row * (CELL + GAP) + CELL / 2,
      );
      dummy.scale.set(CELL, height, CELL);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, color);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

    // Placement: right half on wide screens, upper half on phones. Slides
    // up and shrinks away as the chapter leaves.
    const leave = ease(p.exit);
    const base = narrow
      ? { x: -0.08, y: 0.58, s: 0.5 }
      : { x: Math.min(0.95, halfW - 0.85), y: -0.05, s: 0.9 };
    g.position.set(base.x, base.y + leave * 0.8, 0);
    g.scale.setScalar(base.s * (1 - leave * 0.4) * (0.85 + 0.15 * smooth.current.on));
    g.rotation.set(-0.95 + leave * 0.3, -0.35 + Math.sin(p.pin * Math.PI) * 0.12, 0);
  });

  return (
    <group ref={group} visible={false}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]}>
        <planeGeometry args={[COLUMNS * (CELL + GAP) + 0.3, ROWS * (CELL + GAP) + 0.3]} />
        <meshStandardMaterial color="#0c1117" roughness={0.9} metalness={0} />
      </mesh>
      <gridHelper
        args={[ROWS * (CELL + GAP) + 0.3, ROWS, "#1e2530", "#1a212c"]}
        position={[0, 0.001, 0]}
      />
      <instancedMesh ref={bars} args={[undefined, undefined, COUNT]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.45} metalness={0.1} />
      </instancedMesh>
    </group>
  );
}
