import * as React from "react";
import { cn } from "@/lib/utils";

type ChapterProps = Omit<React.ComponentProps<"section">, "title"> & {
  id: string;
  /** Two-digit index shown in the corner label, for example "02". */
  index: string;
  /** Short chapter name shown after the index. */
  label: string;
  /** How far the reader scrolls, in viewports, while the stage stays pinned. */
  length?: number;
  /** The first chapter: its text is visible on arrival and only fades out. */
  intro?: boolean;
  /** The last pinned chapter: its text stays put instead of fading out. */
  hold?: boolean;
  /** Decorative layer behind the text. Hidden from assistive technology. */
  visual?: React.ReactNode;
  /** Where the text panel sits on the stage. */
  align?: "start" | "end" | "center";
};

/**
 * One scene of the home page film.
 *
 * The section is taller than the viewport and its stage is `position: sticky`,
 * so scrolling through the section holds the stage still while the motion
 * layer animates its lines against scroll progress. Without JavaScript, or
 * under prefers-reduced-motion, the CSS collapses each chapter to a plain
 * block with everything visible, so the story reads top to bottom either way.
 */
export function Chapter({
  id,
  index,
  label,
  length = 1,
  intro,
  hold,
  visual,
  align = "end",
  className,
  children,
  style,
  ...props
}: ChapterProps) {
  return (
    <section
      id={id}
      data-chapter=""
      data-intro={intro ? "" : undefined}
      data-hold={hold ? "" : undefined}
      aria-labelledby={`${id}-title`}
      className={cn("chapter", className)}
      style={{ ...style, ["--chapter-length" as string]: length }}
      {...props}
    >
      <div className="chapter-stage">
        {visual && (
          <div aria-hidden className="chapter-visual">
            {visual}
          </div>
        )}
        <div
          className={cn(
            "chapter-panel mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-12",
            // Phones: text at the top of the stage, which is the edge that
            // enters the viewport first, so a frame is never picture-only.
            "self-start pt-24 pb-6",
            align === "start" && "sm:pt-28",
            align === "center" && "sm:self-center sm:pt-0",
            align === "end" && "sm:self-end sm:pt-0 sm:pb-20",
          )}
        >
          <p className="label mb-6" data-line>
            <span className="tabular">{index}</span>
            <span className="mx-2 text-line-strong">/</span>
            {label}
          </p>
          {children}
        </div>
      </div>
    </section>
  );
}
