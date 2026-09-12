"use client";

import * as React from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";

/**
 * The Build page's one object: a structure of glass slabs that assembles as
 * you scroll and lights up as the form below is filled in. Hovering one of
 * the four kinds of work lifts its tier. The pointer leans the whole thing.
 *
 * State comes in through a tiny store so the DOM (form fields, hover) can
 * talk to the canvas without re-rendering it.
 */

export const buildState = {
  /** 0 to 1 as the page is scrolled through the hero. */
  scroll: 0,
  /** Index of the hovered kind, or -1. */
  hover: -1,
  /** How many of the form's fields have something in them, 0 to 4. */
  filled: 0,
  pointer: { x: 0, y: 0 },
};

const TIERS = 4;
const SLABS_PER_TIER = 3;
const TEAL = new THREE.Color("#5fd3e6");
const DIM = new THREE.Color("#16202b");
const LIT = new THREE.Color("#2b4f5c");

function Structure() {
  const group = React.useRef<THREE.Group>(null);
  const tiers = React.useRef<THREE.Group[]>([]);
  const materials = React.useRef<THREE.MeshStandardMaterial[]>([]);
  const smooth = React.useRef({ hover: -1, lift: new Array(TIERS).fill(0) as number[], x: 0, y: 0, filled: 0 });
  const scratch = React.useMemo(() => new THREE.Color(), []);

  useFrame(({ clock }, delta) => {
    const g = group.current;
    if (!g) return;
    const dt = Math.min(delta, 0.05);
    const t = clock.elapsedTime;
    const s = smooth.current;
    s.x = THREE.MathUtils.damp(s.x, buildState.pointer.x, 4, dt);
    s.y = THREE.MathUtils.damp(s.y, buildState.pointer.y, 4, dt);
    s.filled = THREE.MathUtils.damp(s.filled, buildState.filled, 4, dt);
    g.rotation.y = 0.6 + s.x * 0.25 + t * 0.04;
    g.rotation.x = 0.28 - s.y * 0.12;

    tiers.current.forEach((tier, i) => {
      if (!tier) return;
      // Assembles bottom-up with scroll; the hovered tier lifts and opens.
      const built = THREE.MathUtils.clamp((buildState.scroll * 1.6 - i * 0.22) / 0.4, 0, 1);
      const eased = built * built * (3 - 2 * built);
      const target = buildState.hover === i ? 1 : 0;
      s.lift[i] = THREE.MathUtils.damp(s.lift[i]!, target, 6, dt);
      const lift = s.lift[i]!;
      tier.position.y = i * 0.42 + (1 - eased) * 1.2 + lift * 0.18 + Math.sin(t * 0.8 + i) * 0.015;
      tier.scale.setScalar(0.7 + 0.3 * eased);
      tier.children.forEach((slab, j) => {
        const spread = 1 + lift * 0.35;
        slab.position.x = (j - 1) * 0.62 * spread;
        const material = materials.current[i * SLABS_PER_TIER + j];
        if (material) {
          const litness = Math.max(lift, THREE.MathUtils.clamp(s.filled - i, 0, 1));
          material.color.copy(scratch.copy(DIM).lerp(LIT, litness));
          material.emissive.copy(TEAL);
          material.emissiveIntensity = 0.1 + litness * 0.5;
          material.opacity = 0.5 + 0.45 * eased;
        }
      });
    });
  });

  return (
    <group ref={group} position={[0, -0.75, 0]}>
      {Array.from({ length: TIERS }, (_, i) => (
        <group
          key={i}
          ref={(node) => { if (node) tiers.current[i] = node; }}
        >
          {Array.from({ length: SLABS_PER_TIER }, (_, j) => (
            <RoundedBox key={j} args={[0.56, 0.12, 0.9]} radius={0.03} smoothness={4}>
              <meshStandardMaterial
                ref={(node) => { if (node) materials.current[i * SLABS_PER_TIER + j] = node; }}
                color="#16202b"
                emissive="#5fd3e6"
                emissiveIntensity={0.04}
                roughness={0.25}
                metalness={0.35}
                transparent
                opacity={0.9}
              />
            </RoundedBox>
          ))}
        </group>
      ))}
    </group>
  );
}

export function BuildScene({ assembled = false }: { assembled?: boolean }) {
  // Away from the Build page there is no bridge: assemble fully and lean
  // toward the pointer on our own.
  React.useEffect(() => {
    if (!assembled) return;
    buildState.scroll = 1;
    buildState.filled = 0;
    const onMove = (event: PointerEvent) => {
      buildState.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      buildState.pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [assembled]);
  return (
    <Canvas
      camera={{ position: [0, 0.6, assembled ? 6.8 : 5.2], fov: 32 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      style={{ position: "absolute", inset: 0 }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 4, 3]} intensity={1.4} />
      <directionalLight position={[-3, 1, -2]} intensity={0.5} color="#5fd3e6" />
      <Structure />
    </Canvas>
  );
}

/**
 * Wires the page to the store: scroll through the hero, hover on the kinds,
 * and how many form fields have content. Rendered once on the Build page.
 */
export function BuildSceneBridge() {
  React.useEffect(() => {
    const onScroll = () => {
      buildState.scroll = Math.min(1, window.scrollY / (window.innerHeight * 0.9) + 0.6);
    };
    const onMove = (event: PointerEvent) => {
      buildState.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      buildState.pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    const onInput = () => {
      const fields = ["name", "email", "timeline", "message"];
      buildState.filled = fields.filter((id) => {
        const el = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | null;
        return el && el.value.trim().length > 0;
      }).length;
    };
    const kinds = Array.from(document.querySelectorAll<HTMLElement>("[data-kind]"));
    const enters = kinds.map((el, i) => {
      const enter = () => { buildState.hover = i; };
      const leave = () => { buildState.hover = -1; };
      el.addEventListener("pointerenter", enter);
      el.addEventListener("pointerleave", leave);
      return () => {
        el.removeEventListener("pointerenter", enter);
        el.removeEventListener("pointerleave", leave);
      };
    });
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("input", onInput);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("input", onInput);
      enters.forEach((off) => off());
    };
  }, []);
  return null;
}
