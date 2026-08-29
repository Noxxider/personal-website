"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type Tool = { href: Route; label: string; exact?: boolean };

export const privateTools: Tool[] = [
  { href: "/private", label: "Index", exact: true },
  { href: "/private/pr", label: "PR" },
  { href: "/private/probation", label: "Probation" },
  { href: "/private/episodes", label: "Episodes" },
];

export function PrivateNav() {
  const pathname = usePathname();
  const normalised = pathname.replace(/\/$/, "") || "/";

  return (
    <nav className="mt-6 flex flex-wrap gap-1.5" aria-label="Private tools">
      {privateTools.map((tool) => {
        const active = tool.exact
          ? normalised === tool.href
          : normalised.startsWith(tool.href);
        return (
          <Link
            key={tool.href}
            href={tool.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-[0.8125rem] font-medium transition-colors",
              active
                ? "bg-ink text-paper"
                : "border border-line-strong text-ink-muted hover:border-ink hover:text-ink",
            )}
          >
            {tool.label}
          </Link>
        );
      })}
    </nav>
  );
}
