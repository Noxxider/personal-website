"use client";

import * as React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowUpRightIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

/**
 * The web chapter's visual: the apps themselves, running live inside the
 * film. A fixed composition so nothing stretches: the pendulum fills the
 * left column, the shift board sits above the orbits on the right, each
 * panel clipped and its content sized to fill. The whole fan leans toward
 * the pointer.
 *
 * The apps only mount once the chapter is within a viewport of the screen,
 * and phones get the pendulum alone.
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

function Panel({
  title,
  href,
  className,
  depth,
  children,
}: {
  title: string;
  href: "/work/pendulum" | "/work/shift" | "/work/orbits";
  className?: string;
  depth: number;
  children: React.ReactNode;
}) {
  return (
    <article
      className={cn(
        "flex min-h-0 flex-col overflow-hidden rounded-2xl border border-line bg-surface/90 shadow-2xl shadow-black/40 backdrop-blur",
        className,
      )}
      style={{ transform: `translateZ(${depth}px)` }}
    >
      <header className="flex shrink-0 items-center justify-between border-b border-line px-4 py-2">
        <span className="label">{title}</span>
        <Link
          href={href}
          className="label inline-flex items-center gap-1 text-ink-muted transition-colors hover:text-signal"
        >
          Full page
          <ArrowUpRightIcon aria-hidden className="size-3" />
        </Link>
      </header>
      <div className="min-h-0 flex-1 p-2.5">{children}</div>
    </article>
  );
}

export function LiveApps() {
  const root = React.useRef<HTMLDivElement>(null);
  const [near, setNear] = React.useState(false);
  const [narrow, setNarrow] = React.useState(false);

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

  React.useEffect(() => {
    const node = root.current;
    if (!node) return;
    let frame = 0;
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = (event.clientY / window.innerHeight) * 2 - 1;
      if (!frame) {
        frame = requestAnimationFrame(() => {
          frame = 0;
          node.style.transform = `rotateY(${x * 5}deg) rotateX(${-y * 3}deg)`;
        });
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const placeholder = <div className="h-full w-full rounded-lg bg-ground" aria-hidden />;

  return (
    <div className="[perspective:1600px]">
      <div
        ref={root}
        className={cn(
          "grid gap-3 transition-transform duration-300 ease-out [transform-style:preserve-3d]",
          narrow
            ? "h-[42svh] grid-cols-1"
            : "h-[min(62svh,38rem)] grid-cols-[1.15fr_1fr] grid-rows-[1.35fr_1fr]",
        )}
      >
        <Panel title="Double pendulum" href="/work/pendulum" depth={24} className={narrow ? "" : "row-span-2"}>
          {near ? <DoublePendulum compact /> : placeholder}
        </Panel>
        {!narrow && (
          <>
            <Panel title="Shift" href="/work/shift" depth={12}>
              {near ? <ShiftBoard compact /> : placeholder}
            </Panel>
            <Panel title="Orbits" href="/work/orbits" depth={0}>
              {near ? <OrbitsLab compact /> : placeholder}
            </Panel>
          </>
        )}
      </div>
    </div>
  );
}
