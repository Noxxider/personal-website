"use client";

import * as React from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { presence, progress } from "./film-state";
import { AMBER, TEAL, SURFACE_2, clamp01, damp, ease, makeRandom, useStage } from "./scene-utils";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Mono text on a transparent canvas, in the page's own monospace. */
function makeText(lines: string[], width: number, height: number, align: CanvasTextAlign = "center", color = "#7b8593") {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d")!;
  const family = getComputedStyle(document.documentElement).getPropertyValue("--font-mono") || "monospace";
  context.font = `500 ${Math.round(height * 0.62)}px ${family}`;
  context.fillStyle = color;
  context.textBaseline = "middle";
  context.textAlign = align;
  const step = width / lines.length;
  lines.forEach((line, i) => {
    const x = align === "center" ? step * (i + 0.5) : align === "left" ? 4 : width - 4;
    context.fillText(line, x, height / 2);
  });
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

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
      height: booked ? 0.07 + random() * 0.15 : 0.012,
      booked,
      order: random(),
    });
  }
  return out;
})();

/** The booking that moves, and where it goes. */
const FROM = 3 * ROWS + 5;
const TO = 5 * ROWS + 8;
slots[FROM] = { height: 0.22, booked: true, order: 0.3 };
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
  const caption = React.useRef<THREE.Mesh>(null);
  const dayLabels = React.useMemo(() => makeText(DAYS, 1024, 80, "center", "#a3adbb"), []);
  const hourLabels = React.useMemo(() => makeText(["18", "12", "06"], 80, 512, "right", "#a3adbb"), []);
  const conflictLabel = React.useMemo(() => makeText(["conflict, moved"], 512, 72, "left", "#f2a65a"), []);

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
        height = 0.012 + (0.22 - 0.012) * local * (1 - ease(reflow));
        color = scratch.copy(tealColor).lerp(amberColor, ease(reflow * 2));
      } else if (i === TO) {
        height = 0.012 + (0.22 - 0.012) * ease((reflow - 0.4) / 0.6);
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
    const leave = ease(p.exit / 0.4);
    const base = narrow
      ? { x: 0, y: -0.72, s: 0.56 }
      : { x: Math.min(0.95, halfW - 0.95), y: 0.0, s: 0.72 };
    g.position.set(base.x, base.y + leave * 1.1, 0);
    // Holds back until the Earth has mostly left, then grows in.
    const arrive = ease((p.enter - 0.7) / 0.3);
    const size = base.s * (1 - leave * 0.4) * (0.7 + 0.3 * arrive) * arrive * (1 - leave);
    g.scale.setScalar(Math.max(0.0001, size));
    g.visible = size > 0.12;
    g.rotation.set(-0.46 + leave * 0.3, Math.sin(p.pin * Math.PI) * 0.04, 0);
    if (caption.current) {
      const material = caption.current.material as THREE.MeshBasicMaterial;
      material.opacity = ease((reflow - 0.35) / 0.3) * (1 - leave);
    }
  });

  return (
    <group ref={group} visible={false}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]}>
        <planeGeometry args={[COLUMNS * (CELL + GAP) + 0.16, ROWS * (CELL + GAP) + 0.16]} />
        <meshStandardMaterial color="#0c1117" roughness={0.9} metalness={0} />
      </mesh>
      {/* Day names along the far edge, hours down the left, both lying flat. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, -(ROWS * (CELL + GAP)) / 2 - 0.2]}>
        <planeGeometry args={[COLUMNS * (CELL + GAP), 0.2]} />
        <meshBasicMaterial map={dayLabels} transparent depthWrite={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-(COLUMNS * (CELL + GAP)) / 2 - 0.2, 0.002, 0]}>
        <planeGeometry args={[0.2, ROWS * (CELL + GAP)]} />
        <meshBasicMaterial map={hourLabels} transparent depthWrite={false} />
      </mesh>
      <mesh
        ref={caption}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[
          -((COLUMNS * CELL + (COLUMNS - 1) * GAP) / 2) + 6 * (CELL + GAP) + 0.2,
          0.003,
          -((ROWS * CELL + (ROWS - 1) * GAP) / 2) + 8 * (CELL + GAP) + CELL / 2,
        ]}
      >
        <planeGeometry args={[0.9, 0.13]} />
        <meshBasicMaterial map={conflictLabel} transparent opacity={0} depthWrite={false} />
      </mesh>
      <instancedMesh ref={bars} args={[undefined, undefined, COUNT]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.45} metalness={0.1} />
      </instancedMesh>
    </group>
  );
}
