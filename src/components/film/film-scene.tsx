"use client";

import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { setLoading } from "./film-state";
import { CAMERA_Z, FOV } from "./scene-utils";
import { Earth } from "./earth";
import { ScheduleScene } from "./schedule-scene";
import { OrbitsScene } from "./orbits-scene";
import { CardsScene } from "./cards-scene";
import { OffClockScene } from "./offclock-scene";
import { MarksScene } from "./marks-scene";

/** Mirrors three's default loading manager into the loader overlay. Wired
 * in an effect, so no React state changes during another component's
 * render, which drei's progress hook is prone to in development. */
function LoadingBridge() {
  React.useEffect(() => {
    const manager = THREE.DefaultLoadingManager;
    const previous = manager.onProgress;
    manager.onProgress = (_url, loaded, total) => {
      setLoading({ fraction: total ? loaded / total : 0 });
    };
    return () => {
      manager.onProgress = previous;
    };
  }, []);
  return null;
}

/** Mounts once everything under Suspense has resolved; lifts the loader after
 * the first couple of frames have actually drawn. */
function Ready({ onReady }: { onReady: () => void }) {
  const frames = React.useRef(0);
  useFrame(() => {
    if (frames.current > 2) return;
    frames.current += 1;
    if (frames.current === 2) {
      onReady();
      setLoading({ fraction: 1, done: true });
    }
  });
  return null;
}

/**
 * One canvas, one camera, every scene of the film. Each scene reads the
 * shared scroll progress and decides for itself whether it is on stage.
 */
export default function FilmScene({ onReady }: { onReady: () => void }) {
  return (
    <Canvas
      camera={{ position: [0, 0, CAMERA_Z], fov: FOV, near: 0.1, far: 30 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      style={{ position: "absolute", inset: 0 }}
    >
      <LoadingBridge />
      <ambientLight intensity={0.5} />
      <directionalLight position={[2.5, 3, 4]} intensity={1.4} />
      <directionalLight position={[-3, -1, 2]} intensity={0.35} color="#5fd3e6" />
      <React.Suspense fallback={null}>
        <Earth />
        <ScheduleScene />
        <OrbitsScene />
        <CardsScene />
        <OffClockScene />
        <MarksScene />
        <Ready onReady={onReady} />
      </React.Suspense>
    </Canvas>
  );
}
