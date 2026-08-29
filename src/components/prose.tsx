import * as React from "react";
import { cn } from "@/lib/utils";

/** Body copy at a comfortable measure with our own rhythm, not a plugin. */
export function Prose({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "max-w-[62ch] text-[1.0625rem] leading-[1.7] text-ink-muted [&>p+p]:mt-5 [&_a]:text-ink [&_a]:underline [&_a]:decoration-line-strong [&_a]:underline-offset-4 [&_a:hover]:decoration-signal [&_em]:font-display [&_em]:text-[1.15em] [&_em]:text-ink [&_strong]:font-medium [&_strong]:text-ink",
        className,
      )}
      {...props}
    />
  );
}
