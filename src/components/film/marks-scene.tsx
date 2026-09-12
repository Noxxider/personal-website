"use client";

import * as React from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { pointer, presence, progress } from "./film-state";
import { INK, damp, ease, useStage } from "./scene-utils";
import { site } from "@/content/site";

/**
 * The elsewhere chapter: two chunky tiles carrying the LinkedIn and GitHub
 * wordmarks, drifting in space and drawn toward the pointer. Decoration
 * only; the real links are the two big anchors in the page, which sit right
 * below these and take the keyboard focus.
 */

const TILE = 0.62;

/** The wordmark drawn with the page's own sans, on a transparent canvas. */
function makeLabel(text: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext("2d")!;
  const family = getComputedStyle(document.body).fontFamily || "sans-serif";
  context.fillStyle = INK;
  context.textAlign = "center";
  context.textBaseline = "middle";
  let size = 96;
  context.font = `500 ${size}px ${family}`;
  while (context.measureText(text).width > 420 && size > 40) {
    size -= 4;
    context.font = `500 ${size}px ${family}`;
  }
  context.fillText(text, 256, 262);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function Tile({ label, index }: { label: string; index: number }) {
  const group = React.useRef<THREE.Group>(null);
  const texture = React.useMemo(() => makeLabel(label), [label]);
  const drift = React.useRef({ x: 0, y: 0 });

  useFrame(({ clock }, delta) => {
    const g = group.current;
    if (!g) return;
    const dt = Math.min(delta, 0.05);
    const t = clock.elapsedTime + index * 2.1;
    const side = index === 0 ? -1 : 1;
    const enter = ease((progress.elsewhere.enter - index * 0.15) / 0.6);

    // Magnetised to the pointer, gently.
    const aimX = pointer.active ? pointer.x * 0.22 : 0;
    const aimY = pointer.active ? pointer.y * 0.16 : 0;
    drift.current.x = damp(drift.current.x, aimX, 3, dt);
    drift.current.y = damp(drift.current.y, aimY, 3, dt);

    g.position.set(
      side * 0.62 + drift.current.x + Math.sin(t * 0.6) * 0.03,
      Math.cos(t * 0.8) * 0.04 + drift.current.y - (1 - enter) * 0.4,
      0,
    );
    g.rotation.set(
      Math.sin(t * 0.5) * 0.12 - drift.current.y * 0.6,
      Math.sin(t * 0.4) * 0.18 + drift.current.x * 0.8 + side * 0.15,
      0,
    );
    g.scale.setScalar(Math.max(0.0001, enter));
  });

  return (
    <group ref={group}>
      <RoundedBox args={[TILE, TILE, 0.12]} radius={0.07} smoothness={6}>
        <meshStandardMaterial color="#141b26" roughness={0.3} metalness={0.35} />
      </RoundedBox>
      <mesh position={[0, 0, 0.062]}>
        <planeGeometry args={[TILE * 0.9, TILE * 0.9]} />
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
    g.position.set(0, narrow ? 0.62 : 0.55, 0);
    g.scale.setScalar(narrow ? 0.6 : 1);
  });

  return (
    <group ref={group} visible={false}>
      {site.socials.map((s, i) => (
        <Tile key={s.href} label={s.label} index={i} />
      ))}
    </group>
  );
}
