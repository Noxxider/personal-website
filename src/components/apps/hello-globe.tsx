"use client";

import * as React from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import countries from "@/content/countries.json";
import { sayHello, type Hello } from "@/app/work/hello/actions";
import { Button } from "@/components/ui/button";

/**
 * The shared globe. Lights stand at country centroids, taller where more
 * people have pressed the button. The Earth is the same day map the front
 * page uses; here it is lit evenly and left to the visitor to spin.
 */

const DEG = Math.PI / 180;
const table = countries as unknown as Record<string, [number, number]>;

function toXYZ(lat: number, lon: number, r: number) {
  const phi = lat * DEG;
  const lambda = lon * DEG;
  return new THREE.Vector3(
    r * Math.cos(phi) * Math.cos(lambda),
    r * Math.sin(phi),
    -r * Math.cos(phi) * Math.sin(lambda),
  );
}

function Lights({ hellos, mine }: { hellos: Hello[]; mine: string | null }) {
  const max = Math.max(1, ...hellos.map((h) => h.count));
  return (
    <group>
      {hellos.map((h) => {
        const centre = table[h.country];
        if (!centre) return null;
        const position = toXYZ(centre[0], centre[1], 1);
        const height = 0.05 + 0.3 * Math.log1p(h.count) / Math.log1p(max);
        const up = position.clone().normalize();
        const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), up);
        const isMine = h.country === mine;
        return (
          <group key={h.country} position={position} quaternion={quaternion}>
            <mesh position={[0, height / 2, 0]}>
              <cylinderGeometry args={[0.006, 0.012, height, 8]} />
              <meshBasicMaterial color={isMine ? "#f2a65a" : "#5fd3e6"} transparent opacity={0.9} />
            </mesh>
            <mesh position={[0, height, 0]}>
              <sphereGeometry args={[isMine ? 0.022 : 0.014, 12, 12]} />
              <meshBasicMaterial color={isMine ? "#f2a65a" : "#e8ecf1"} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function Globe({ hellos, mine }: { hellos: Hello[]; mine: string | null }) {
  const [day, night] = useTexture(["/earth/day.webp", "/earth/night.webp"], (loaded) => {
    for (const t of Array.isArray(loaded) ? loaded : [loaded]) {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
    }
  });
  const group = React.useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.03;
  });
  return (
    <group ref={group} rotation={[0.35, 2.2, 0]}>
      <mesh>
        <sphereGeometry args={[1, 96, 96]} />
        <meshStandardMaterial
          map={day}
          emissiveMap={night}
          emissive="#f0c890"
          emissiveIntensity={0.35}
          roughness={0.9}
          metalness={0}
        />
      </mesh>
      <mesh scale={1.04}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshBasicMaterial color="#5fd3e6" transparent opacity={0.06} side={THREE.BackSide} />
      </mesh>
      <Lights hellos={hellos} mine={mine} />
    </group>
  );
}

export function HelloGlobe({
  initial,
  connected,
}: {
  initial: Hello[];
  connected: boolean;
}) {
  const [hellos, setHellos] = React.useState(initial);
  const [mine, setMine] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();
  const [note, setNote] = React.useState<string | null>(null);
  const total = hellos.reduce((n, h) => n + h.count, 0);

  const press = () => {
    startTransition(async () => {
      const result = await sayHello();
      if (!result.country) {
        setNote("Could not tell which country you are in, so nothing was added.");
        return;
      }
      setMine(result.country);
      setHellos((all) => {
        const existing = all.find((h) => h.country === result.country);
        return existing
          ? all.map((h) => (h.country === result.country ? { ...h, count: h.count + 1 } : h))
          : [...all, { country: result.country!, count: 1 }];
      });
      setNote(
        result.connected
          ? `Hello from ${regionName(result.country)}. It is on the globe for whoever comes next.`
          : `Hello from ${regionName(result.country)}. The database is not connected yet, so this light is only on your screen.`,
      );
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-line bg-surface sm:aspect-[16/11]">
        <Canvas camera={{ position: [0, 0.4, 3.1], fov: 38 }} dpr={[1, 1.75]} gl={{ antialias: true, alpha: true }}>
          <ambientLight intensity={1.1} />
          <directionalLight position={[3, 2, 4]} intensity={1.6} />
          <React.Suspense fallback={null}>
            <Globe hellos={hellos} mine={mine} />
          </React.Suspense>
          <OrbitControls enablePan={false} enableZoom={false} rotateSpeed={0.5} />
        </Canvas>
        <p className="label pointer-events-none absolute bottom-3 left-4">Drag to spin</p>
      </div>

      <div className="space-y-6">
        <div>
          <p className="label">Lights so far</p>
          <p className="mt-1 font-display text-5xl text-ink tabular">{total}</p>
          <p className="label mt-1">from {hellos.length} {hellos.length === 1 ? "country" : "countries"}</p>
        </div>
        <Button onClick={press} disabled={pending} size="lg">
          {pending ? "Placing" : "Say hello from here"}
        </Button>
        <p role="status" aria-live="polite" className="text-sm text-ink-muted">
          {note ??
            (connected
              ? "One press adds a light at your country. Only the country is read, and only a count is kept."
              : "The database is not connected yet, so lights stay on your own screen for now.")}
        </p>
        {hellos.length > 0 && (
          <ol className="max-h-64 space-y-1.5 overflow-y-auto border-t border-line pt-4 text-sm">
            {[...hellos]
              .sort((a, b) => b.count - a.count)
              .slice(0, 12)
              .map((h) => (
                <li key={h.country} className="flex justify-between text-ink-muted">
                  <span>{regionName(h.country)}</span>
                  <span className="font-mono text-ink tabular">{h.count}</span>
                </li>
              ))}
          </ol>
        )}
      </div>
    </div>
  );
}

function regionName(code: string) {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}
