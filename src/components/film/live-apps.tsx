"use client";

import * as React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowUpRightIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

/**
 * The web chapter's visual: the apps themselves, running live inside the
 * film. Three panels in a shallow 3D fan that leans toward the pointer; each
 * one is the real component, so a visitor can release the pendulum, drag a
 * shift or tug an orbit without leaving the page.
 *
 * The apps only mount once the chapter is within a viewport of the screen,
 * and the orbits (a second WebGL context) stay off on phones.
 */

const DoublePendulum = dynamic(
  () => import("@/components/apps/double-pendulum").then((m) => m.DoublePendulum),
  { ssr: false },
);
const ShiftBoard = dynamic(
  () => import("@/components/apps/shift-board").then((m) => m.ShiftBoard),
  { ssr: false },
);
const OrbitsLab = dynamic(
  () => import("@/components/apps/orbits-lab").then((m) => m.OrbitsLab),
  { ssr: false },
);

const panels = [
  { slug: "pendulum", title: "Double pendulum", href: "/work/pendulum" as const },
  { slug: "shift", title: "Shift", href: "/work/shift" as const },
  { slug: "orbits", title: "Orbits", href: "/work/orbits" as const },
];

export function LiveApps() {
  const root = React.useRef<HTMLDivElement>(null);
  const [near, setNear] = React.useState(false);
  const [narrow, setNarrow] = React.useState(false);
  const tilt = React.useRef({ x: 0, y: 0 });

  React.useEffect(() => {
    const node = root.current;
    if (!node) return;
    const media = window.matchMedia("(max-width: 767px)");
    const sync = () => setNarrow(media.matches);
    sync();
    media.addEventListener("change", sync);
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry?.isIntersecting) setNear(true); },
      { rootMargin: "100% 0px" },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", sync);
    };
  }, []);

  // A shallow lean toward the pointer, applied to the whole fan.
  React.useEffect(() => {
    const node = root.current;
    if (!node) return;
    let frame = 0;
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      tilt.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      tilt.current.y = (event.clientY / window.innerHeight) * 2 - 1;
      if (!frame) {
        frame = requestAnimationFrame(() => {
          frame = 0;
          node.style.transform = `rotateY(${tilt.current.x * 6}deg) rotateX(${-tilt.current.y * 4}deg)`;
        });
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const shown = narrow ? panels.slice(0, 1) : panels;

  return (
    <div className="[perspective:1600px]">
      <div
        ref={root}
        className="relative grid gap-4 transition-transform duration-300 ease-out [transform-style:preserve-3d] lg:grid-cols-[1.25fr_1fr]"
      >
        {shown.map((panel, i) => (
          <article
            key={panel.slug}
            className={cn(
              "group relative overflow-hidden rounded-2xl border border-line bg-surface/90 shadow-2xl shadow-black/40 backdrop-blur",
              i === 0 && "lg:row-span-2",
            )}
            style={{ transform: `translateZ(${(2 - i) * 14}px)` }}
          >
            <header className="flex items-center justify-between border-b border-line px-4 py-2.5">
              <span className="label">{panel.title}</span>
              <Link
                href={panel.href}
                className="label inline-flex items-center gap-1 text-ink-muted transition-colors hover:text-signal"
              >
                Full page
                <ArrowUpRightIcon aria-hidden className="size-3" />
              </Link>
            </header>
            <div className={cn("p-3", i === 0 ? "min-h-[18rem] lg:min-h-[26rem]" : "min-h-[12rem]")}>
              {near ? (
                panel.slug === "pendulum" ? (
                  <DoublePendulum compact />
                ) : panel.slug === "shift" ? (
                  <ShiftBoard compact />
                ) : (
                  <OrbitsLab compact />
                )
              ) : (
                <div className="h-full w-full rounded-lg bg-ground" aria-hidden />
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
