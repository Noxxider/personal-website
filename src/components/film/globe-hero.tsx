"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

// Three and the scene are their own chunk, fetched after the page is
// interactive. The server never renders them, so `/` stays static HTML.
const GlobeScene = dynamic(() => import("./globe-scene"), { ssr: false });

function canUseWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") ?? canvas.getContext("webgl"),
    );
  } catch {
    return false;
  }
}

/**
 * The poster is server-rendered inside the arrival chapter, so the first
 * paint and the LCP never wait on WebGL. On a capable device without a
 * reduced-motion preference, a fixed canvas mounts behind the whole film and
 * the poster fades once the first frame has drawn. Everyone else keeps the
 * poster: it is the same picture, standing still.
 */
const noSubscribe = () => () => {};
let decided: "poster" | "canvas" | null = null;
function decideMode() {
  if (decided) return decided;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  decided = !reduced && canUseWebGL() ? "canvas" : "poster";
  return decided;
}

export function GlobeHero() {
  // Server and first client paint agree on the poster; the canvas decision
  // is read once on the client without a state update inside an effect.
  const mode = React.useSyncExternalStore(noSubscribe, decideMode, () => "poster");
  const [ready, setReady] = React.useState(false);

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
        <div className="pointer-events-none fixed inset-0 z-0">
          <GlobeScene onReady={() => setReady(true)} />
        </div>
      )}
    </>
  );
}
