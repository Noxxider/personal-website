"use client";

import * as React from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { pointer, presence, progress } from "./film-state";
import { SURFACE_2, damp, ease, useStage } from "./scene-utils";

/**
 * The web chapter: three cards, each a real screenshot of a real page on a
 * plane with a dark frame, fanned in space, tilting toward the pointer and
 * breathing a little. They rise in with the text and lift away with it.
 */

const SHOTS = ["/work/orbits.png", "/work/pendulum.png", "/work/shift.png"];
const WIDTH = 0.98;
const HEIGHT = 0.5;

function Card({
  texture,
  index,
  offset,
}: {
  texture: THREE.Texture;
  index: number;
  offset: [number, number, number];
}) {
  const group = React.useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const g = group.current;
    if (!g) return;
    const t = clock.elapsedTime + index * 1.7;
    const enter = ease((progress.web.enter - index * 0.12) / 0.7);
    g.position.set(offset[0], offset[1] + Math.sin(t * 0.9) * 0.02 - (1 - enter) * 0.5, offset[2]);
    g.rotation.set(Math.sin(t * 0.7) * 0.02, -0.42 + index * -0.05, 0);
    g.scale.setScalar((0.85 + 0.15 * enter) * (1 - index * 0.12));
  });
  return (
    <group ref={group}>
      <mesh position={[0, 0, -0.012]}>
        <planeGeometry args={[WIDTH + 0.05, HEIGHT + 0.05]} />
        <meshStandardMaterial color={SURFACE_2} roughness={0.6} metalness={0.15} />
      </mesh>
      <mesh>
        <planeGeometry args={[WIDTH, HEIGHT]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
}

export function CardsScene() {
  const textures = useTexture(SHOTS, (loaded) => {
    for (const texture of Array.isArray(loaded) ? loaded : [loaded]) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 8;
    }
  });
  const group = React.useRef<THREE.Group>(null);
  const { narrow, halfW } = useStage();
  const smooth = React.useRef({ on: 0, tx: 0, ty: 0 });

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const dt = Math.min(delta, 0.05);
    const on = presence("web");
    smooth.current.on = damp(smooth.current.on, on, 8, dt);
    g.visible = smooth.current.on > 0.001;
    if (!g.visible) return;

    const aim = pointer.active ? pointer : { x: 0, y: 0 };
    smooth.current.tx = damp(smooth.current.tx, aim.x, 4, dt);
    smooth.current.ty = damp(smooth.current.ty, aim.y, 4, dt);

    const leave = ease(progress.web.exit);
    const base = narrow
      ? { x: 0.05, y: 0.98, s: 0.55 }
      : { x: Math.min(0.55, halfW - 1.5), y: 0.32, s: 1.55 };
    g.position.set(base.x, base.y + leave * 0.9, 0);
    g.scale.setScalar(base.s * (1 - leave * 0.3));
    g.rotation.set(-smooth.current.ty * 0.18, smooth.current.tx * 0.28, 0);
  });

  return (
    <group ref={group} visible={false}>
      {textures.map((texture, i) => (
        <Card
          key={SHOTS[i]}
          texture={texture}
          index={i}
          offset={[i * (narrow ? 0.34 : 0.42), i * -0.09, i * -0.5]}
        />
      ))}
    </group>
  );
}
