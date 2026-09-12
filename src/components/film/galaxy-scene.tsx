"use client";

import * as React from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { presence, progress } from "./film-state";
import { damp, ease, makeRandom, useStage } from "./scene-utils";

/**
 * The systems chapter: a galaxy. The copy says the scheduling software books
 * appointments for about a million people, so here are about a million
 * points, each one a person, turning slowly on their own. Scroll flies the
 * camera down into the disc; a scattering of amber points are the conflicts
 * that get caught and moved.
 *
 * Everything is one buffer and one draw call. The size drops on phones.
 */

const ARMS = 3;
const RADIUS = 2.4;
const SPIN = 1.1;
const RANDOMNESS = 0.32;
const POWER = 2.6;

function buildGalaxy(count: number) {
  const random = makeRandom(1000003);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const scales = new Float32Array(count);
  const inside = new THREE.Color("#8fd0dd");
  const outside = new THREE.Color("#1a5563");
  const amber = new THREE.Color("#f2a65a");
  const c = new THREE.Color();
  for (let i = 0; i < count; i++) {
    const r = Math.pow(random(), 0.85) * RADIUS;
    const arm = ((i % ARMS) / ARMS) * Math.PI * 2;
    const spin = r * SPIN;
    const spread = RANDOMNESS * r;
    const rx = Math.pow(random(), POWER) * (random() < 0.5 ? 1 : -1) * spread;
    const ry = Math.pow(random(), POWER) * (random() < 0.5 ? 1 : -1) * spread * 0.45;
    const rz = Math.pow(random(), POWER) * (random() < 0.5 ? 1 : -1) * spread;
    positions[i * 3] = Math.cos(arm + spin) * r + rx;
    positions[i * 3 + 1] = ry;
    positions[i * 3 + 2] = Math.sin(arm + spin) * r + rz;
    if (random() < 0.004) c.copy(amber);
    else c.copy(inside).lerp(outside, Math.min(1, r / RADIUS));
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
    scales[i] = 0.5 + random() * 1.5;
  }
  return { positions, colors, scales };
}

const shader = {
  vertexShader: /* glsl */ `
    attribute float aScale;
    uniform float uSize;
    uniform float uTime;
    varying vec3 vColor;
    void main() {
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      float twinkle = 0.85 + 0.15 * sin(uTime * 1.7 + position.x * 9.0 + position.z * 7.0);
      gl_PointSize = uSize * aScale * twinkle / -mv.z;
      gl_Position = projectionMatrix * mv;
      vColor = color;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform float uFade;
    varying vec3 vColor;
    void main() {
      float d = distance(gl_PointCoord, vec2(0.5));
      float a = pow(max(0.0, 1.0 - d * 2.0), 3.0);
      gl_FragColor = vec4(vColor, a * uFade * 0.42);
    }
  `,
};

export function GalaxyScene() {
  const group = React.useRef<THREE.Group>(null);
  const material = React.useRef<THREE.ShaderMaterial>(null);
  const { narrow, halfW } = useStage();
  const count = narrow ? 180_000 : 700_000;
  const data = React.useMemo(() => buildGalaxy(count), [count]);
  const uniforms = React.useMemo(
    () => ({ uSize: { value: 10 }, uTime: { value: 0 }, uFade: { value: 0 } }),
    [],
  );
  const smooth = React.useRef({ on: 0, spin: 0 });

  useFrame(({ clock }, delta) => {
    const g = group.current;
    if (!g) return;
    const dt = Math.min(delta, 0.05);
    const on = presence("systems");
    smooth.current.on = damp(smooth.current.on, on, 8, dt);
    g.visible = smooth.current.on > 0.001;
    if (!g.visible) return;

    const p = progress.systems;
    // Arrives as the Earth shrinks into its centre; leaves before the orbits.
    const arrive = ease((p.enter - 0.55) / 0.45);
    const leave = ease(p.exit / 0.4);
    const fly = ease(p.pin);

    // Turns by itself, always. Scroll only changes where you are looking from.
    smooth.current.spin += dt * 0.035;
    g.rotation.y = smooth.current.spin + fly * 0.4;
    g.rotation.x = 1.05 - fly * 0.45;

    const base = narrow ? { x: 0, y: -0.62, s: 0.4 } : { x: Math.min(1.15, halfW - 0.9), y: 0.05, s: 0.6 };
    const size = base.s * (0.55 + 0.45 * arrive) * (1 + fly * 0.25) * (1 - leave);
    g.position.set(base.x, base.y + leave * 0.6, 0);
    g.scale.setScalar(Math.max(0.0001, size));
    g.visible = size > 0.05;

    if (material.current) {
      material.current.uniforms.uTime!.value = clock.elapsedTime;
      material.current.uniforms.uFade!.value = Math.min(1, arrive * 1.2) * (1 - leave) * smooth.current.on;
    }
  });

  return (
    <group ref={group} visible={false}>
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[data.colors, 3]} />
          <bufferAttribute attach="attributes-aScale" args={[data.scales, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={material}
          args={[{ ...shader, uniforms }]}
          vertexColors
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
