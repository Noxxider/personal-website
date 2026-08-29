import * as React from "react";
import { cn } from "@/lib/utils";

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      className={cn(
        "block text-[0.8125rem] font-medium text-ink-muted",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
