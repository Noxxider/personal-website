"use client";

import * as React from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { pointer, presence, progress } from "./film-state";
import { damp, ease, useStage } from "./scene-utils";

/**
 * The elsewhere chapter: the LinkedIn and GitHub marks as two chunky tiles
 * floating in space, drawn toward the pointer. Decoration only; the real
 * links are the anchors in the page right below, which take keyboard focus.
 *
 * The marks are the standard 24-unit brand paths, drawn onto a canvas and
 * used as the face of each tile.
 */

const TILE = 0.66;

const MARKS: Record<string, { path: string; fill: string; face: string }> = {
  LinkedIn: {
    path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
    fill: "rgba(232, 236, 241, 0.72)",
    face: "#151c27",
  },
  GitHub: {
    path: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
    fill: "rgba(232, 236, 241, 0.72)",
    face: "#151c27",
  },
};

/** The mark drawn large and centred on a transparent square. */
function makeFace(label: string) {
  const mark = MARKS[label];
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d")!;
  if (mark) {
    const scale = (size * 0.56) / 24;
    context.translate((size - 24 * scale) / 2, (size - 24 * scale) / 2);
    context.scale(scale, scale);
    context.fillStyle = mark.fill;
    context.fill(new Path2D(mark.path));
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function Tile({ label, index, spread }: { label: string; index: number; spread: number }) {
  const group = React.useRef<THREE.Group>(null);
  const texture = React.useMemo(() => makeFace(label), [label]);
  const drift = React.useRef({ x: 0, y: 0 });
  const face = MARKS[label]?.face ?? "#141b26";

  useFrame(({ clock }, delta) => {
    const g = group.current;
    if (!g) return;
    const dt = Math.min(delta, 0.05);
    const t = clock.elapsedTime + index * 2.1;
    const side = index === 0 ? -1 : 1;
    const enter = ease((progress.elsewhere.enter - 0.45 - index * 0.12) / 0.45);
    const leave = ease(progress.elsewhere.exit);

    const aimX = pointer.active ? pointer.x * 0.24 : 0;
    const aimY = pointer.active ? pointer.y * 0.18 : 0;
    drift.current.x = damp(drift.current.x, aimX, 3, dt);
    drift.current.y = damp(drift.current.y, aimY, 3, dt);

    g.position.set(
      side * spread + drift.current.x + Math.sin(t * 0.6) * 0.03,
      Math.cos(t * 0.8) * 0.015 + drift.current.y * 0.6 - (1 - enter) * 0.4 + leave * 0.9,
      0,
    );
    g.rotation.set(
      Math.sin(t * 0.5) * 0.06 - drift.current.y * 0.5,
      Math.sin(t * 0.4) * 0.1 + drift.current.x * 0.7,
      0,
    );
    g.scale.setScalar(Math.max(0.0001, enter * (1 - leave * 0.4)));
  });

  return (
    <group ref={group}>
      <RoundedBox args={[TILE, TILE, 0.14]} radius={0.12} smoothness={8}>
        <meshStandardMaterial color={face} roughness={0.9} metalness={0} />
      </RoundedBox>
      <mesh position={[0, 0, 0.072]}>
        <planeGeometry args={[TILE, TILE]} />
        <meshBasicMaterial map={texture} transparent toneMapped={false} />
      </mesh>
    </group>
  );
}

export function MarksScene() {
  const group = React.useRef<THREE.Group>(null);
  const { narrow } = useStage();
  const smooth = React.useRef({ on: 0 });

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const dt = Math.min(delta, 0.05);
    const on = presence("elsewhere");
    smooth.current.on = damp(smooth.current.on, on, 8, dt);
    g.visible = smooth.current.on > 0.001;
    if (!g.visible) return;
    g.position.set(0, narrow ? 0.5 : 0.5, 0);
    g.scale.setScalar(narrow ? 0.62 : 1);
  });

  return (
    <group ref={group} visible={false}>
      {Object.keys(MARKS).map((label, i) => (
        <Tile key={label} label={label} index={i} spread={narrow ? 0.62 : 0.72} />
      ))}
    </group>
  );
}
