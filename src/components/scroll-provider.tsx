"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "lenis/dist/lenis.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * One scroll engine for the whole site: Lenis smooths the native scroll and
 * drives GSAP's ScrollTrigger from its own tick, so the two never disagree
 * about where the page is. Under prefers-reduced-motion nothing is created
 * and the browser scrolls as it always did.
 *
 * Mounted once in the root layout. The App Router keeps the layout across
 * navigations, so ScrollTrigger only needs a refresh per route, not a rebuild.
 */
export function ScrollProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.documentElement.classList.add("motion-ok");

    const lenis = new Lenis({ lerp: 0.1, anchors: true });
    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      document.documentElement.classList.remove("motion-ok");
    };
  }, []);

  React.useEffect(() => {
    // New page, new layout: measure again once it has painted.
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  return children;
}
