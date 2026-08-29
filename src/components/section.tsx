import * as React from "react";
import { cn } from "@/lib/utils";

export function Container({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-12", className)}
      {...props}
    />
  );
}

type SectionProps = React.ComponentProps<"section"> & {
  /** Rendered as the section's heading. Omit when the content brings its own. */
  title?: string;
  /** Optional line under the heading. */
  lede?: string;
};

export function Section({
  className,
  title,
  lede,
  children,
  ...props
}: SectionProps) {
  return (
    <section className={cn("py-16 sm:py-24", className)} {...props}>
      <Container>
        {title && (
          <div className="mb-10 border-t border-line pt-8 sm:mb-14">
            <h2 className="font-display text-title text-balance">{title}</h2>
            {lede && (
              <p className="mt-3 max-w-[52ch] text-[1.0625rem] leading-relaxed text-ink-muted">
                {lede}
              </p>
            )}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}
