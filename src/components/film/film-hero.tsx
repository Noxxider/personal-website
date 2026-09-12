"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { getLoading, setLoading, subscribeLoading } from "./film-state";
import { site } from "@/content/site";

// Three, the scenes and their textures are one lazy chunk, fetched after the
// page is interactive. The server never renders them, so `/` stays static.
const FilmScene = dynamic(() => import("./film-scene"), { ssr: false });

function canUseWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

const noSubscribe = () => () => {};
let decided: "poster" | "canvas" | null = null;
function decideMode() {
  if (decided) return decided;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  decided = !reduced && canUseWebGL() ? "canvas" : "poster";
  return decided;
}
const serverLoading = { fraction: 0, done: false };

/**
 * The poster is server-rendered inside the arrival chapter, so the first
 * paint never waits on WebGL. On a capable device without a reduced-motion
 * preference a fixed canvas mounts behind the whole film; a quiet loading
 * screen covers the page while the Earth's maps come in, then lifts. Everyone
 * else keeps the poster: the same picture, standing still.
 */
export function FilmHero() {
  const mode = React.useSyncExternalStore(noSubscribe, decideMode, () => "poster");
  const loading = React.useSyncExternalStore(
    subscribeLoading,
    getLoading,
    () => serverLoading,
  );
  const [ready, setReady] = React.useState(false);
  const [lifted, setLifted] = React.useState(false);

  // Nobody waits more than a few seconds for decoration.
  React.useEffect(() => {
    if (mode !== "canvas") return;
    const timer = window.setTimeout(() => setLoading({ done: true }), 8000);
    return () => window.clearTimeout(timer);
  }, [mode]);

  React.useEffect(() => {
    if (!loading.done) return;
    const timer = window.setTimeout(() => setLifted(true), 700);
    return () => window.clearTimeout(timer);
  }, [loading.done]);

  const percent = Math.round(loading.fraction * 100);

  return (
    <>
      <picture
        className={cn(
          "absolute inset-0 transition-opacity duration-700 ease-out",
          ready ? "opacity-0" : "opacity-100",
        )}
      >
        <source media="(max-width: 767px)" srcSet="/poster-earth-mobile.jpg" />
        <img
          src="/poster-earth.jpg"
          alt=""
          width={1440}
          height={900}
          fetchPriority="high"
          decoding="async"
          className="h-full w-full object-cover object-right"
        />
      </picture>

      {mode === "canvas" && (
        <>
          <div className="pointer-events-none fixed inset-0 z-0">
            <FilmScene onReady={() => setReady(true)} />
          </div>

          {!lifted && (
            <div
              role="status"
              aria-live="polite"
              className={cn(
                "fixed inset-0 z-50 grid place-items-center bg-ground/72 backdrop-blur-sm transition-opacity duration-700 ease-out",
                loading.done ? "opacity-0" : "opacity-100",
              )}
            >
              <div className="w-[min(28rem,80vw)]">
                <p className="font-display text-3xl tracking-tight text-ink">
                  {site.name}
                </p>
                <div className="mt-6 h-px w-full bg-line">
                  <div
                    className="h-px bg-signal transition-[width] duration-300 ease-out"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <p className="label mt-3">{loading.done ? "Ready" : "Loading"}</p>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
