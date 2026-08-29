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
  /** Two digit index shown in the rule above the heading. */
  index?: string;
  eyebrow?: string;
};

export function Section({
  className,
  index,
  eyebrow,
  children,
  ...props
}: SectionProps) {
  return (
    <section className={cn("py-16 sm:py-24", className)} {...props}>
      <Container>
        {(index || eyebrow) && (
          <div className="mb-8 flex items-baseline gap-5 border-t border-line pt-5 sm:mb-12">
            {index && <span className="eyebrow tabular">{index}</span>}
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}
