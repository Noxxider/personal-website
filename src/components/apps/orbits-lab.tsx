"use client";

import * as React from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  createSystem,
  drift,
  energy,
  step,
  type Integrator,
  type System,
} from "@/lib/sims/nbody";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * The N-body lab. The simulation lives in a ref and advances in useFrame; a
 * small readout of energy drift is written straight to the DOM a few times a
 * second, so React never re-renders on a physics tick. Dragging on the
 * canvas adds a passing mass at the pointer.
 */

const BODIES = 6;
const TRAIL = 220;

type Settings = {
  integrator: Integrator;
  dt: number;
  centralMass: number;
  running: boolean;
};

type Lab = { system: System; e0: number; steps: number };

type Scratch = {
  dummy: THREE.Object3D;
  plane: THREE.Plane;
  hit: THREE.Vector3;
  trail: Float32Array;
  head: number;
  filled: number;
  dragging: boolean;
  lastStats: number;
};

function makeScratch(): Scratch {
  return {
    dummy: new THREE.Object3D(),
    plane: new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
    hit: new THREE.Vector3(),
    trail: new Float32Array(BODIES * TRAIL * 3),
    head: 0,
    filled: 0,
    dragging: false,
    lastStats: 0,
  };
}

// Named as refs so the React Compiler knows their contents may be mutated.
function Scene({
  settingsRef,
  labRef,
  onStats,
}: {
  settingsRef: React.RefObject<Settings>;
  labRef: React.RefObject<Lab>;
  onStats: (text: string) => void;
}) {
  const bodies = React.useRef<THREE.InstancedMesh>(null);
  const trailGeometry = React.useRef<THREE.BufferGeometry>(null);
  const scratch = React.useRef<Scratch | null>(null);
  if (scratch.current === null) scratch.current = makeScratch();
  const glow = React.useRef<THREE.Mesh>(null);
  const segments = React.useMemo(() => new Float32Array(BODIES * (TRAIL - 1) * 6), []);
  const trailColors = React.useMemo(() => new Float32Array(BODIES * (TRAIL - 1) * 6), []);
  const { pointer, camera, raycaster } = useThree();

  React.useEffect(() => {
    const down = () => { if (scratch.current) scratch.current.dragging = true; };
    const up = () => { if (scratch.current) scratch.current.dragging = false; };
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  useFrame(({ clock }) => {
    const l = labRef.current;
    const cfg = settingsRef.current;
    const mesh = bodies.current;
    const t = scratch.current;
    if (!l || !cfg || !mesh || !t) return;
    const s = l.system;

    const pull = (() => {
      if (!t.dragging) return undefined;
      raycaster.setFromCamera(pointer, camera);
      if (!raycaster.ray.intersectPlane(t.plane, t.hit)) return undefined;
      return { x: t.hit.x, y: t.hit.y, z: 0, mass: 0.4 };
    })();

    if (cfg.running) {
      // Several substeps per frame so the step size, not the frame rate,
      // decides the accuracy.
      const substeps = Math.max(1, Math.round(0.02 / cfg.dt));
      for (let i = 0; i < substeps; i++) step(s, cfg.integrator, cfg.dt, pull);
      l.steps += substeps;

      for (let i = 0; i < s.n; i++) {
        const base = (i * TRAIL + t.head) * 3;
        t.trail[base] = s.pos[i * 3]!;
        t.trail[base + 1] = s.pos[i * 3 + 1]!;
        t.trail[base + 2] = s.pos[i * 3 + 2]!;
      }
      t.head = (t.head + 1) % TRAIL;
      t.filled = Math.min(TRAIL, t.filled + 1);
    }

    for (let i = 0; i < s.n; i++) {
      t.dummy.position.set(s.pos[i * 3]!, s.pos[i * 3 + 1]!, s.pos[i * 3 + 2]!);
      t.dummy.scale.setScalar(i === 0 ? 0.06 + 0.02 * s.mass[0]! : 0.018 + s.mass[i]! * 1.4);
      t.dummy.updateMatrix();
      mesh.setMatrixAt(i, t.dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (glow.current) {
      glow.current.position.set(s.pos[0]!, s.pos[1]!, s.pos[2]!);
      glow.current.scale.setScalar((0.06 + 0.02 * s.mass[0]!) * 2.6);
    }

    const geometry = trailGeometry.current;
    if (geometry) {
      const array = geometry.attributes.position!.array as Float32Array;
      const colors = geometry.attributes.color!.array as Float32Array;
      let k = 0;
      let c = 0;
      for (let i = 0; i < s.n; i++) {
        for (let j = 0; j < t.filled - 1; j++) {
          const a = (i * TRAIL + ((t.head + j) % TRAIL)) * 3;
          const b = (i * TRAIL + ((t.head + j + 1) % TRAIL)) * 3;
          array[k++] = t.trail[a]!; array[k++] = t.trail[a + 1]!; array[k++] = t.trail[a + 2]!;
          array[k++] = t.trail[b]!; array[k++] = t.trail[b + 1]!; array[k++] = t.trail[b + 2]!;
          // Oldest samples fade toward the ground so every orbit has a direction.
          const fade = 0.08 + 0.92 * (j / Math.max(1, t.filled - 2)) ** 1.6;
          for (let v = 0; v < 2; v++) {
            colors[c++] = 0.373 * fade; colors[c++] = 0.827 * fade; colors[c++] = 0.902 * fade;
          }
        }
      }
      geometry.setDrawRange(0, k / 3);
      geometry.attributes.position!.needsUpdate = true;
      geometry.attributes.color!.needsUpdate = true;
    }

    if (clock.elapsedTime - t.lastStats > 0.25) {
      t.lastStats = clock.elapsedTime;
      const e = energy(s);
      const d = drift(l.e0, e);
      onStats(`${(d * 100).toFixed(3)}%|${e.toFixed(5)}|${l.steps}`);
    }
  });

  return (
    <>
      <instancedMesh ref={bodies} args={[undefined, undefined, BODIES]}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial color="#e8ecf1" />
      </instancedMesh>
      {/* A soft additive glow on the central mass, so it reads as the sun. */}
      <mesh ref={glow}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial
          color="#5fd3e6"
          transparent
          opacity={0.18}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <lineSegments>
        <bufferGeometry ref={trailGeometry}>
          <bufferAttribute attach="attributes-position" args={[segments, 3]} usage={THREE.DynamicDrawUsage} />
          <bufferAttribute attach="attributes-color" args={[trailColors, 3]} usage={THREE.DynamicDrawUsage} />
        </bufferGeometry>
        <lineBasicMaterial vertexColors transparent opacity={0.9} />
      </lineSegments>
      <gridHelper args={[6, 24, "#1e2530", "#161c26"]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.02]} />
    </>
  );
}

export function OrbitsLab({ compact = false }: { compact?: boolean }) {
  const [integrator, setIntegrator] = React.useState<Integrator>("verlet");
  const [dt, setDt] = React.useState(0.004);
  const [centralMass, setCentralMass] = React.useState(1);
  const [running, setRunning] = React.useState(true);
  const [seed, setSeed] = React.useState(1919);
  const settings = React.useRef<Settings>({ integrator, dt, centralMass, running });
  const lab = React.useRef<Lab | null>(null);
  if (lab.current === null) {
    const system = createSystem(BODIES, seed, centralMass);
    lab.current = { system, e0: energy(system), steps: 0 };
  }
  const stats = React.useRef<HTMLDListElement>(null);

  React.useEffect(() => {
    settings.current = { integrator, dt, centralMass, running };
  }, [integrator, dt, centralMass, running]);

  const reset = React.useCallback((nextSeed = seed, mass = centralMass) => {
    const system = createSystem(BODIES, nextSeed, mass);
    lab.current = { system, e0: energy(system), steps: 0 };
  }, [seed, centralMass]);

  const onStats = React.useCallback((text: string) => {
    const node = stats.current;
    if (!node) return;
    const [d, e, steps] = text.split("|");
    const cells = node.querySelectorAll("dd");
    if (cells[0]) cells[0].textContent = d ?? "";
    if (cells[1]) cells[1].textContent = e ?? "";
    if (cells[2]) cells[2].textContent = Number(steps).toLocaleString();
  }, []);

  return (
    <div className={compact ? "h-full" : "grid gap-6 lg:grid-cols-[1fr_18rem]"}>
      <div className={compact ? "relative h-full min-h-[11rem] overflow-hidden rounded-lg bg-ground" : "relative aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-surface sm:aspect-[16/10]"}>
        <Canvas
          camera={{ position: [0, -1.2, 3.4], fov: 40 }}
          dpr={[1, 1.75]}
          gl={{ antialias: true, alpha: true }}
          onCreated={({ gl, camera }) => {
            gl.setClearColor(0x000000, 0);
            camera.lookAt(0, 0, 0);
          }}
          className="touch-none"
        >
          <Scene settingsRef={settings} labRef={lab as React.RefObject<Lab>} onStats={onStats} />
        </Canvas>
        <p className="label pointer-events-none absolute bottom-3 left-4">
          Press and drag to add a passing mass
        </p>
      </div>

      {!compact && <div className="space-y-6">
        <fieldset>
          <legend className="label">Integrator</legend>
          <div className="mt-2 grid grid-cols-2 gap-1 rounded-lg border border-line p-1">
            {(["verlet", "euler"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setIntegrator(option)}
                aria-pressed={integrator === option}
                className={cn(
                  "rounded-md px-3 py-2 text-sm transition-colors",
                  integrator === option ? "bg-ink text-ground" : "text-ink-muted hover:text-ink",
                )}
              >
                {option === "verlet" ? "Velocity Verlet" : "Euler"}
              </button>
            ))}
          </div>
          <p className="label mt-2">
            {integrator === "verlet"
              ? "Symplectic. The drift stays bounded."
              : "First order. Watch the drift climb."}
          </p>
        </fieldset>

        <div>
          <Label htmlFor="dt">Time step: {dt.toFixed(3)}</Label>
          <input
            id="dt"
            type="range"
            min={0.001}
            max={0.02}
            step={0.001}
            value={dt}
            onChange={(e) => setDt(Number(e.target.value))}
            className="mt-2 w-full accent-[#5fd3e6]"
          />
        </div>

        <div>
          <Label htmlFor="mass">Central mass: {centralMass.toFixed(1)}</Label>
          <input
            id="mass"
            type="range"
            min={0.5}
            max={3}
            step={0.1}
            value={centralMass}
            onChange={(e) => {
              const m = Number(e.target.value);
              setCentralMass(m);
              reset(seed, m);
            }}
            className="mt-2 w-full accent-[#5fd3e6]"
          />
        </div>

        <dl ref={stats} className="grid grid-cols-3 gap-3 border-t border-line pt-4 lg:grid-cols-1">
          <div>
            <dt className="label">Energy drift</dt>
            <dd className="mt-1 font-mono text-lg text-ink tabular">0.000%</dd>
          </div>
          <div>
            <dt className="label">Total energy</dt>
            <dd className="mt-1 font-mono text-lg text-ink tabular">0</dd>
          </div>
          <div>
            <dt className="label">Steps</dt>
            <dd className="mt-1 font-mono text-lg text-ink tabular">0</dd>
          </div>
        </dl>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setRunning((r) => !r)}>
            {running ? "Pause" : "Run"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => reset()}>
            Reset
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const next = Math.floor(Math.random() * 100_000);
              setSeed(next);
              reset(next);
            }}
          >
            New system
          </Button>
        </div>
      </div>}
    </div>
  );
}
