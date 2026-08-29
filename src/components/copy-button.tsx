"use client";

import * as React from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type State = "idle" | "copied" | "error";

export function CopyButton({ value, label }: { value: string; label: string }) {
  const [state, setState] = React.useState<State>("idle");
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  React.useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    clearTimeout(timer.current);
    try {
      if (!navigator.clipboard) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(value);
      setState("copied");
    } catch {
      setState("error");
    }
    timer.current = setTimeout(() => setState("idle"), 2200);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-2 rounded-full border px-3.5 text-[0.8125rem] font-medium transition-colors duration-200",
        state === "copied"
          ? "border-signal text-signal"
          : "border-line-strong text-ink-muted hover:border-ink hover:text-ink",
      )}
    >
      {state === "copied" ? (
        <CheckIcon aria-hidden className="size-3.5" />
      ) : (
        <CopyIcon aria-hidden className="size-3.5" />
      )}
      <span>
        {state === "copied"
          ? "Copied"
          : state === "error"
            ? "Copy failed"
            : "Copy"}
      </span>
      <span className="sr-only">{label}</span>
      <span aria-live="polite" className="sr-only">
        {state === "copied"
          ? `${label} copied to clipboard`
          : state === "error"
            ? `Could not copy ${label}. Select it manually instead.`
            : ""}
      </span>
    </button>
  );
}
