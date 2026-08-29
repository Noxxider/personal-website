"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type RevealProps = React.ComponentProps<"div"> & {
  /** Stagger in milliseconds, applied as a CSS transition delay. */
  delay?: number;
  as?: "div" | "section" | "li" | "article" | "header";
};

/**
 * Reveals its children on first scroll into view.
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
  const Component = Tag as React.ElementType;
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      // Very old browser: reveal immediately by touching the DOM directly,
      // which keeps this effect free of synchronous state updates.
      node.dataset["visible"] = "true";
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );

    observer.observe(node);
    return () => observer.disconnect();
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
