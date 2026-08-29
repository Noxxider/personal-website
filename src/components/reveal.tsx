"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type RevealProps = React.ComponentProps<"div"> & {
  /** Stagger in milliseconds, applied as a CSS transition delay. */
  delay?: number;
  as?: "div" | "section" | "li" | "article" | "header";
};

/**
 * Reveals its children once they scroll into view.
 *
 * This checks position on scroll rather than using IntersectionObserver. The
 * observer only fires when a threshold is crossed, so jumping straight from the
 * top of the page to the bottom never triggers the sections in between and they
 * stay blank for the rest of the visit. A rect check has no such gap.
 *
 * Content is visible without JavaScript (see the noscript style in the root
 * layout) and the transition is disabled under prefers-reduced-motion.
 */
export function Reveal({
  className,
  delay = 0,
  as: Tag = "div",
  style,
  children,
  ...props
}: RevealProps) {
  const ref = React.useRef<HTMLElement>(null);
  const [visible, setVisible] = React.useState(false);
  const Component = Tag as React.ElementType;

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let frame = 0;

    const stop = () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    const check = () => {
      frame = 0;
      const rect = node.getBoundingClientRect();
      const entered = rect.top < window.innerHeight * 0.92;
      const scrolledPast = rect.bottom < 0;
      if (entered || scrolledPast) {
        setVisible(true);
        stop();
      }
    };

    function schedule() {
      if (!frame) frame = requestAnimationFrame(check);
    }

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    // Deferred by a frame rather than run inline, so the first paint is not
    // blocked and the effect body stays free of synchronous state updates.
    schedule();

    return stop;
  }, []);

  return (
    <Component
      ref={ref}
      data-visible={visible ? "true" : "false"}
      className={cn("reveal", className)}
      style={{ ...style, ["--reveal-delay" as string]: `${delay}ms` }}
      {...props}
    >
      {children}
    </Component>
  );
}
