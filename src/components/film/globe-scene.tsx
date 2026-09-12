"use client";

import * as React from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import globe from "@/content/globe.json";

/**
 * The home page globe: a dot-matrix Earth with a teal atmosphere, drawn from
 * Natural Earth land data (see scripts/build-globe.mjs). No textures.
 *
 * Scroll drives it in three moves, read straight from the chapter sections:
 *   arrival   idles, slowly turning, sitting to the right of the name
 *   canada    turns so Canada faces the camera, pushes in, draws the outline
 *   systems   recedes to a small disc in the top right corner and stays
 *
 * Loaded client-side only, behind a poster that shows until the first frame.
 */

const DEG = Math.PI / 180;
const TAU = Math.PI * 2;
const TEAL = "#5fd3e6";
/** Roughly the middle of Canada: the point the zoom ends on. No city. */
const CANADA = { lat: 61, lon: -97 };
/** Camera distance and vertical field of view; both fixed, the globe moves. */
const CAMERA_Z = 3.2;
const FOV = 38;
/** Half the visible height at z = 0, in world units. */
const HALF_HEIGHT = Math.tan((FOV / 2) * DEG) * CAMERA_Z;

type Pose = { x: number; y: number; s: number };

function toXYZ(lat: number, lon: number, r: number): [number, number, number] {
  const phi = lat * DEG;
  const lambda = lon * DEG;
  return [
    r * Math.cos(phi) * Math.sin(lambda),
    r * Math.sin(phi),
    r * Math.cos(phi) * Math.cos(lambda),
  ];
}

const landPositions = (() => {
  const source = globe.land as number[];
  const out = new Float32Array(source.length * 1.5);
  for (let i = 0, j = 0; i < source.length; i += 2, j += 3) {
    const [x, y, z] = toXYZ(source[i]!, source[i + 1]!, 1);
    out[j] = x;
    out[j + 1] = y;
    out[j + 2] = z;
  }
  return out;
})();

/** Canada as line segments, mainland first so the draw-on starts there. */
const outlinePositions = (() => {
  const rings = [...(globe.outline as number[][])].sort(
    (a, b) => b.length - a.length,
  );
  const out: number[] = [];
  for (const ring of rings) {
    const n = ring.length / 2;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      out.push(...toXYZ(ring[2 * i]!, ring[2 * i + 1]!, 1.004));
      out.push(...toXYZ(ring[2 * j]!, ring[2 * j + 1]!, 1.004));
    }
  }
  return new Float32Array(out);
})();

const atmosphereShader = {
  // Drawn on the back faces of a sphere a little larger than the globe. Only
  // the band between the globe's edge and the halo's edge is visible; the
  // per-fragment view direction keeps it symmetric wherever the globe sits.
  vertexShader: /* glsl */ `
    varying vec3 vNormal;
    varying vec3 vPosition;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vPosition = mv.xyz;
      gl_Position = projectionMatrix * mv;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform vec3 uColor;
    uniform float uIntensity;
    varying vec3 vNormal;
    varying vec3 vPosition;
    void main() {
      float facing = dot(normalize(vNormal), normalize(-vPosition));
      // About -0.38 right at the globe's edge, 0 at the halo's outer edge.
      float rim = pow(clamp(-facing / 0.38, 0.0, 1.0), 1.6);
      gl_FragColor = vec4(uColor, rim * uIntensity);
    }
  `,
};

/** A soft round sprite so the dots are discs rather than squares. */
function makeDotTexture() {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d")!;
  const gradient = context.createRadialGradient(
    size / 2, size / 2, 0,
    size / 2, size / 2, size / 2,
  );
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.55, "rgba(255,255,255,1)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

const ease = (t: number) => {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
};
const span = (t: number, from: number, to: number) => ease((t - from) / (to - from));
const mix = (a: Pose, b: Pose, t: number): Pose => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
  s: a.s + (b.s - a.s) * t,
});

function Globe() {
  const group = React.useRef<THREE.Group>(null);
  const outline = React.useRef<THREE.LineSegments>(null);
  const dots = React.useRef<THREE.PointsMaterial>(null);
  const halo = React.useRef<THREE.ShaderMaterial>(null);
  const lineMaterial = React.useRef<THREE.LineBasicMaterial>(null);
  const { size } = useThree();

  const dotTexture = React.useMemo(() => makeDotTexture(), []);
  const uniforms = React.useMemo(
    () => ({ uColor: { value: new THREE.Color(TEAL) }, uIntensity: { value: 0.5 } }),
    [],
  );

  /** Raw scroll progress from the page; smoothed per frame below. */
  const target = React.useRef({ zoom: 0, recede: 0 });
  const smooth = React.useRef({ zoom: 0, recede: 0 });
  const idle = React.useRef(0.6);

  React.useEffect(() => {
    const zoom = ScrollTrigger.create({
      trigger: "#canada",
      start: "top bottom",
      end: "bottom bottom",
      onUpdate: (self) => { target.current.zoom = self.progress; },
    });
    const recede = ScrollTrigger.create({
      trigger: "#systems",
      start: "top bottom",
      end: "top top",
      onUpdate: (self) => { target.current.recede = self.progress; },
    });
    return () => {
      zoom.kill();
      recede.kill();
    };
  }, []);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const dt = Math.min(delta, 0.05);

    smooth.current.zoom = THREE.MathUtils.damp(smooth.current.zoom, target.current.zoom, 7, dt);
    smooth.current.recede = THREE.MathUtils.damp(smooth.current.recede, target.current.recede, 7, dt);
    const zoom = smooth.current.zoom;
    const recede = smooth.current.recede;

    // Turn first, then push in, then draw the outline on.
    const turn = span(zoom, 0, 0.6);
    const push = span(zoom, 0.2, 0.9);
    const draw = span(zoom, 0.55, 1);

    // Idle drift only while nothing has asked the globe to face anywhere.
    if (target.current.zoom <= 0.001) idle.current += dt * 0.05;
    const targetY = -CANADA.lon * DEG;
    const deltaY = ((((targetY - idle.current) % TAU) + TAU + Math.PI) % TAU) - Math.PI;
    g.rotation.y = idle.current + deltaY * turn;
    g.rotation.x = CANADA.lat * DEG * turn;

    // Where the globe sits on screen for each move, in world units at z = 0.
    const aspect = size.width / size.height;
    const narrow = aspect < 0.8;
    const halfWidth = HALF_HEIGHT * aspect;
    const arrival: Pose = narrow
      ? { x: 0.3, y: 0.62, s: 0.78 }
      : { x: Math.min(1.05, halfWidth - 0.7), y: -0.05, s: 1.18 };
    // Scale that makes about 0.8 globe-units of Canada fill the frame, given
    // the front of the sphere ends up at world z = s, that close to the lens.
    const needed = aspect >= 1 ? 0.8 : 0.8 / aspect;
    const zoomed: Pose = {
      x: 0,
      y: narrow ? 0.3 : 0.05,
      s: (2 * HALF_HEIGHT) / (2 * Math.tan((FOV / 2) * DEG) + needed),
    };
    const corner: Pose = {
      x: halfWidth - (narrow ? 0.34 : 0.5),
      y: HALF_HEIGHT - (narrow ? 0.36 : 0.48),
      s: narrow ? 0.16 : 0.2,
    };

    const pose = mix(mix(arrival, zoomed, push), corner, ease(recede));
    g.position.set(pose.x, pose.y, 0);
    g.scale.setScalar(pose.s);

    if (outline.current) {
      const count = outlinePositions.length / 3;
      outline.current.geometry.setDrawRange(0, Math.floor(count * draw));
    }
    if (dots.current) dots.current.opacity = 0.9 - 0.45 * recede;
    if (lineMaterial.current) lineMaterial.current.opacity = 0.9 * (1 - recede);
    if (halo.current) halo.current.uniforms.uIntensity!.value = 0.5 - 0.25 * recede;
  });

  return (
    <group ref={group}>
      {/* The body: slightly lighter than the page so the disc reads, and it
          hides the dots on the far side. */}
      <mesh>
        <sphereGeometry args={[0.992, 48, 48]} />
        <meshBasicMaterial color="#121821" />
      </mesh>

      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[landPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          ref={dots}
          color={TEAL}
          size={0.017}
          sizeAttenuation
          map={dotTexture}
          alphaTest={0.2}
          transparent
          opacity={0.9}
          depthWrite={false}
        />
      </points>

      <lineSegments ref={outline}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[outlinePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          ref={lineMaterial}
          color="#e8ecf1"
          transparent
          opacity={0.9}
          depthWrite={false}
        />
      </lineSegments>

      <mesh scale={1.08}>
        <sphereGeometry args={[1, 48, 48]} />
        <shaderMaterial
          ref={halo}
          args={[{ ...atmosphereShader, uniforms }]}
          side={THREE.BackSide}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

export default function GlobeScene({ onReady }: { onReady?: () => void }) {
  return (
    <Canvas
      camera={{ position: [0, 0, CAMERA_Z], fov: FOV, near: 0.1, far: 20 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        onReady?.();
      }}
      style={{ position: "absolute", inset: 0 }}
    >
      <Globe />
    </Canvas>
  );
}
