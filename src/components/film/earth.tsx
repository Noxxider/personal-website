"use client";

import * as React from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import globe from "@/content/globe.json";
import { progress } from "./film-state";
import { DEG, FOV, HALF_HEIGHT, damp, ease, span, useStage, TEAL } from "./scene-utils";

/**
 * A real Earth: day and night maps, city lights on the dark side, specular
 * water, a moving sun, drifting clouds and a teal atmosphere. The maps are
 * the NASA-derived 2K set that ships with three.js, re-encoded as WebP.
 *
 * Scroll drives it in three moves, read from the shared chapter progress:
 *   arrival   lit from the left, terminator across it, idling right of the name
 *   canada    the sun comes round, the Earth turns and pushes in on Canada
 *   systems   drifts up and shrinks away as the bookings grid arrives
 */

const TAU = Math.PI * 2;
/** Roughly the middle of Canada: the point the zoom faces. No city. */
const CANADA = { lat: 61, lon: -97 };
/** Three's sphere maps longitude 0 to +x and longitude 90 to -z. */
const yawFor = (lon: number) => -(90 + lon) * DEG;

type Pose = { x: number; y: number; s: number };
const mix = (a: Pose, b: Pose, t: number): Pose => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
  s: a.s + (b.s - a.s) * t,
});

function toXYZ(lat: number, lon: number, r: number): [number, number, number] {
  const phi = lat * DEG;
  const lambda = lon * DEG;
  return [
    r * Math.cos(phi) * Math.cos(lambda),
    r * Math.sin(phi),
    -r * Math.cos(phi) * Math.sin(lambda),
  ];
}

/** Canada as line segments, mainland first so the draw-on starts there. */
const outlinePositions = (() => {
  const rings = [...(globe.outline as number[][])].sort((a, b) => b.length - a.length);
  const out: number[] = [];
  for (const ring of rings) {
    const n = ring.length / 2;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      out.push(...toXYZ(ring[2 * i]!, ring[2 * i + 1]!, 1.006));
      out.push(...toXYZ(ring[2 * j]!, ring[2 * j + 1]!, 1.006));
    }
  }
  return new Float32Array(out);
})();

const surfaceShader = {
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorld;
    void main() {
      vUv = uv;
      vNormal = normalize(mat3(modelMatrix) * normal);
      vec4 world = modelMatrix * vec4(position, 1.0);
      vWorld = world.xyz;
      gl_Position = projectionMatrix * viewMatrix * world;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D uDay;
    uniform sampler2D uNight;
    uniform sampler2D uSpecular;
    uniform vec3 uSun;
    uniform vec3 uTeal;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorld;
    void main() {
      vec3 n = normalize(vNormal);
      vec3 view = normalize(cameraPosition - vWorld);
      float sun = dot(n, uSun);
      float daylight = smoothstep(-0.08, 0.22, sun);

      vec3 day = texture2D(uDay, vUv).rgb * (0.22 + 1.05 * max(sun, 0.0));
      vec3 lights = texture2D(uNight, vUv).rgb;
      vec3 night = vec3(0.03, 0.04, 0.06) + lights * vec3(1.0, 0.86, 0.62) * 2.1;
      vec3 color = mix(night, day, daylight);

      float water = texture2D(uSpecular, vUv).r;
      vec3 halfway = normalize(uSun + view);
      float glint = pow(max(dot(n, halfway), 0.0), 160.0) * water * daylight;
      color += vec3(0.9, 0.95, 1.0) * glint * 0.1;

      float rim = pow(1.0 - max(dot(n, view), 0.0), 3.2);
      color += uTeal * rim * (0.1 + 0.28 * daylight);

      gl_FragColor = vec4(color, 1.0);
    }
  `,
};

const cloudShader = {
  vertexShader: surfaceShader.vertexShader,
  fragmentShader: /* glsl */ `
    uniform sampler2D uClouds;
    uniform vec3 uSun;
    varying vec2 vUv;
    varying vec3 vNormal;
    void main() {
      float density = texture2D(uClouds, vUv).r;
      float sun = dot(normalize(vNormal), uSun);
      float lit = 0.06 + 0.94 * smoothstep(-0.1, 0.35, sun);
      gl_FragColor = vec4(vec3(0.92, 0.95, 1.0) * lit, density * 0.55);
    }
  `,
};

const haloShader = {
  vertexShader: /* glsl */ `
    varying vec3 vNormal;
    varying vec3 vView;
    varying vec3 vWorldNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vWorldNormal = normalize(mat3(modelMatrix) * normal);
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vView = normalize(-mv.xyz);
      gl_Position = projectionMatrix * mv;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform vec3 uColor;
    uniform vec3 uSun;
    uniform float uIntensity;
    varying vec3 vNormal;
    varying vec3 vView;
    varying vec3 vWorldNormal;
    void main() {
      float facing = dot(normalize(vNormal), normalize(vView));
      float rim = pow(clamp(-facing / 0.3, 0.0, 1.0), 1.4);
      float lit = 0.3 + 0.7 * smoothstep(-0.4, 0.4, dot(normalize(vWorldNormal), uSun));
      gl_FragColor = vec4(uColor, rim * lit * uIntensity);
    }
  `,
};

export function Earth() {
  const maps = useTexture(
    {
      day: "/earth/day.webp",
      night: "/earth/night.webp",
      specular: "/earth/specular.webp",
      clouds: "/earth/clouds.webp",
    },
    (loaded) => {
      // Delivered in key order: day, night, specular, clouds. The first two
      // are colour; the other two are data and stay linear.
      const list = Array.isArray(loaded) ? loaded : Object.values(loaded);
      list.forEach((texture, i) => {
        texture.anisotropy = 16;
        texture.colorSpace = i < 2 ? THREE.SRGBColorSpace : THREE.NoColorSpace;
      });
    },
  );

  const group = React.useRef<THREE.Group>(null);
  const clouds = React.useRef<THREE.Mesh>(null);
  const surface = React.useRef<THREE.ShaderMaterial>(null);
  const cloudMaterial = React.useRef<THREE.ShaderMaterial>(null);
  const halo = React.useRef<THREE.ShaderMaterial>(null);
  const outline = React.useRef<THREE.LineSegments>(null);
  const lineMaterial = React.useRef<THREE.LineBasicMaterial>(null);
  const { aspect, narrow, halfW } = useStage();

  const sun = React.useMemo(() => new THREE.Vector3(-0.6, 0.5, 0.66).normalize(), []);
  const uniforms = React.useMemo(
    () => ({
      uDay: { value: maps.day },
      uNight: { value: maps.night },
      uSpecular: { value: maps.specular },
      uSun: { value: sun },
      uTeal: { value: new THREE.Color(TEAL) },
    }),
    [maps, sun],
  );
  const cloudUniforms = React.useMemo(
    () => ({ uClouds: { value: maps.clouds }, uSun: { value: sun } }),
    [maps, sun],
  );
  const haloUniforms = React.useMemo(
    () => ({ uColor: { value: new THREE.Color(TEAL) }, uSun: { value: sun }, uIntensity: { value: 0.38 } }),
    [sun],
  );

  const smooth = React.useRef({ zoom: 0, recede: 0, gone: 0 });
  const idle = React.useRef(0.2);
  const sunFrom = React.useMemo(() => new THREE.Vector3(-0.6, 0.5, 0.66).normalize(), []);
  const sunTo = React.useMemo(() => new THREE.Vector3(-0.55, 0.5, 0.75).normalize(), []);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const dt = Math.min(delta, 0.05);

    const canada = progress.canada;
    const zoomTarget = 0.5 * canada.enter + 0.5 * canada.pin;
    smooth.current.zoom = damp(smooth.current.zoom, zoomTarget, 7, dt);
    smooth.current.recede = damp(smooth.current.recede, progress.systems.enter, 7, dt);
    smooth.current.gone = damp(smooth.current.gone, progress.systems.enter, 7, dt);
    const { zoom, recede, gone } = smooth.current;

    g.visible = gone < 0.999;

    // Turn first, push in second, draw the outline last.
    const turn = span(zoom, 0, 0.6);
    const push = span(zoom, 0.2, 0.9);
    const draw = span(zoom, 0.55, 1);

    if (zoomTarget <= 0.001) idle.current += dt * 0.04;
    const targetY = yawFor(CANADA.lon);
    const deltaY = ((((targetY - idle.current) % TAU) + TAU + Math.PI) % TAU) - Math.PI;
    g.rotation.y = idle.current + deltaY * turn;
    g.rotation.x = CANADA.lat * DEG * turn;

    // The sun comes round from behind as the Earth turns, so Canada is lit.
    const sunMix = span(zoom, 0.05, 0.7);
    if (surface.current) {
      // The same Vector3 is shared by all three materials' uSun uniforms.
      const sunVector = surface.current.uniforms.uSun!.value as THREE.Vector3;
      sunVector.copy(sunFrom).lerp(sunTo, sunMix).normalize();
    }

    if (clouds.current) clouds.current.rotation.y += dt * 0.008;

    const arrival: Pose = narrow
      ? { x: 0.32, y: 0.62, s: 0.8 }
      : { x: Math.min(1.05, halfW - 0.7), y: -0.05, s: 1.18 };
    const needed = aspect >= 1 ? 0.95 : 0.95 / aspect;
    const zoomed: Pose = {
      x: 0,
      y: narrow ? 0.3 : 0.05,
      s: (2 * HALF_HEIGHT) / (2 * Math.tan((FOV / 2) * DEG) + needed),
    };
    // Where it heads as it leaves: up and back, shrinking to nothing.
    const corner: Pose = { x: narrow ? 0.2 : 0.6, y: HALF_HEIGHT + 0.6, s: 0.35 };
    const pose = mix(mix(arrival, zoomed, push), corner, ease(recede));
    const shrink = 1 - ease(gone);
    g.position.set(pose.x, pose.y, 0);
    g.scale.setScalar(Math.max(0.0001, pose.s * shrink));

    if (outline.current) {
      const count = outlinePositions.length / 3;
      outline.current.geometry.setDrawRange(0, Math.floor(count * draw));
    }
    if (lineMaterial.current) lineMaterial.current.opacity = 0.85 * (1 - recede);
    if (halo.current) halo.current.uniforms.uIntensity!.value = 0.38 - 0.18 * recede;
  });

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[1, 96, 96]} />
        <shaderMaterial ref={surface} args={[{ ...surfaceShader, uniforms }]} />
      </mesh>

      <mesh ref={clouds}>
        <sphereGeometry args={[1.012, 64, 64]} />
        <shaderMaterial
          ref={cloudMaterial}
          args={[{ ...cloudShader, uniforms: cloudUniforms }]}
          transparent
          depthWrite={false}
        />
      </mesh>

      <lineSegments ref={outline}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[outlinePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          ref={lineMaterial}
          color={TEAL}
          transparent
          opacity={0.85}
          depthWrite={false}
        />
      </lineSegments>

      <mesh scale={1.055}>
        <sphereGeometry args={[1, 64, 64]} />
        <shaderMaterial
          ref={halo}
          args={[{ ...haloShader, uniforms: haloUniforms }]}
          side={THREE.BackSide}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
