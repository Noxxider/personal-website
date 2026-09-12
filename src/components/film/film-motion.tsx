"use client";

import * as React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { pointer, progress, type ChapterId } from "./film-state";

gsap.registerPlugin(ScrollTrigger);

/**
 * Drives every `[data-chapter]` beneath it from scroll position.
 *
 * Each chapter gets one scrubbed timeline that runs from the moment its stage
 * pins to the moment it releases. Lines marked `data-line` rise in over the
 * first third, hold, and fall out over the last quarter; the chapter element
 * also receives a `--progress` custom property from 0 to 1 that the visual
 * layer can read in CSS. Nothing is created under prefers-reduced-motion, and
 * the markup is fully visible before this runs, so the no-JavaScript page is
 * the same story without the movement.
 */
export function FilmMotion({ children }: { children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const context = gsap.context(() => {
      const chapters = gsap.utils.toArray<HTMLElement>("[data-chapter]", root);

      chapters.forEach((chapter) => {
        const lines = gsap.utils.toArray<HTMLElement>("[data-line]", chapter);
        const intro = chapter.hasAttribute("data-intro");
        const hold = chapter.hasAttribute("data-hold");

        // Three plain triggers feed the shared store the 3D scenes read from:
        // sliding in, pinned, sliding out.
        const id = chapter.id as ChapterId;
        if (id in progress) {
          const record = progress[id];
          ScrollTrigger.create({
            trigger: chapter, start: "top bottom", end: "top top",
            onUpdate: (self) => { record.enter = self.progress; },
          });
          ScrollTrigger.create({
            trigger: chapter, start: "top top", end: "bottom bottom",
            onUpdate: (self) => { record.pin = self.progress; },
          });
          ScrollTrigger.create({
            trigger: chapter, start: "bottom bottom", end: "bottom top",
            onUpdate: (self) => { record.exit = self.progress; },
          });
        }

        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: chapter,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
          },
        });

        // Anchors the timeline to a duration of exactly 1, so the positions
        // below read as fractions of the chapter's scroll length.
        timeline.fromTo(
          chapter,
          { "--progress": 0 },
          { "--progress": 1, duration: 1 },
          0,
        );

        // The entrance runs while the stage is still sliding up into place,
        // before it pins, so one chapter's text is rising as the previous
        // one's has just gone: no dead, empty frame between scenes.
        if (!intro) {
          gsap.fromTo(
            lines,
            { autoAlpha: 0, y: 32 },
            {
              autoAlpha: 1,
              y: 0,
              ease: "none",
              stagger: 0.08,
              scrollTrigger: {
                trigger: chapter,
                start: "top bottom",
                end: "top 20%",
                scrub: 0.6,
              },
            },
          );
        }

        if (!hold) {
          timeline.to(
            lines,
            { autoAlpha: 0, y: -24, duration: 0.14, stagger: 0.02 },
            0.84,
          );
        }
      });

      // Fraunces landing late changes line counts; measure again once it has.
      document.fonts?.ready.then(() => ScrollTrigger.refresh());
    }, root);

    // The scenes tilt and drift toward the pointer; the canvas itself takes
    // no pointer events, so the position is read at the window.
    const onMove = (event: PointerEvent) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -((event.clientY / window.innerHeight) * 2 - 1);
      pointer.active = true;
    };
    const onLeave = () => { pointer.active = false; };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      context.revert();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <div ref={ref}>{children}</div>;
}
