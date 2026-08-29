import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "h-11 w-full rounded-lg border border-line-strong bg-paper-raised px-3.5 text-[0.9375rem] text-ink transition-colors",
        "placeholder:text-ink-faint hover:border-ink-faint focus:border-ink focus:outline-none",
        "aria-invalid:border-signal",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
