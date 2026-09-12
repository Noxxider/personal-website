"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon } from "@/components/icons";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { chapterIds, progress, type ChapterId } from "@/components/film/film-state";
import { nav, site } from "@/content/site";
import { cn } from "@/lib/utils";

const chapterLabels: Record<ChapterId, string> = {
  arrival: "Arrival",
  canada: "Canada",
  systems: "Systems",
  physics: "Physics",
  web: "Web",
  elsewhere: "Elsewhere",
};

/**
 * On the home page the header is part of the film: a mono readout of the
 * current chapter and a hairline that fills as the film plays, both read
 * straight from the shared scroll state on each frame. Nav links are
 * magnetic, leaning a few pixels toward the pointer.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const readout = React.useRef<HTMLSpanElement>(null);
  const bar = React.useRef<HTMLSpanElement>(null);
  const home = pathname === "/";

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    if (!home) return;
    let frame = 0;
    let last = "";
    const tick = () => {
      frame = requestAnimationFrame(tick);
      let current: ChapterId = "arrival";
      let filled = 0;
      for (const id of chapterIds) {
        const p = progress[id];
        if (p.enter > 0.5 && p.exit < 0.5) current = id;
        filled += Math.min(1, p.enter) + p.pin;
      }
      const past = progress.elsewhere.exit >= 0.5;
      const index = past ? chapterIds.length : chapterIds.indexOf(current);
      const text = past
        ? `0${index} / The offer`
        : `0${index} / ${chapterLabels[current]}`;
      if (text !== last && readout.current) {
        readout.current.textContent = text;
        last = text;
      }
      if (bar.current) {
        bar.current.style.transform = `scaleX(${Math.min(1, filled / (chapterIds.length * 2))})`;
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [home]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-colors duration-300",
        scrolled
          ? "border-line bg-ground/75 backdrop-blur-md"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link
          href="/"
          onClick={(event) => {
            if (pathname === "/") {
              event.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          className="group flex items-baseline gap-2.5 rounded-sm"
          aria-label={`${site.name}, home`}
        >
          <span className="font-display text-xl leading-none tracking-tight">
            {site.name}
          </span>
          <span
            aria-hidden
            className="pulse-dot hidden h-1.5 w-1.5 rounded-full bg-signal sm:block"
          />
        </Link>

        {home && (
          <span
            ref={readout}
            aria-hidden
            className="label tabular pointer-events-none absolute left-1/2 hidden -translate-x-1/2 md:block"
          >
            00 / Arrival
          </span>
        )}

        <nav className="hidden items-center gap-1 sm:flex" aria-label="Main">
          {nav.map((item) => (
            <MagneticLink
              key={item.href}
              href={item.href}
              active={isActive(item.href)}
            >
              {item.label}
            </MagneticLink>
          ))}
        </nav>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            className="-mr-2 rounded-full p-2 text-ink transition-colors hover:bg-surface-2 sm:hidden"
            aria-label="Open menu"
          >
            <MenuIcon className="size-5" />
          </SheetTrigger>
          <SheetContent aria-describedby={undefined}>
            <SheetTitle className="label">Menu</SheetTitle>
            <nav className="mt-10 flex flex-col" aria-label="Mobile">
              {[{ label: "Home", href: "/" } as const, ...nav].map((item) => (
                <SheetClose asChild key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={cn(
                      "border-b border-line py-4 font-display text-3xl tracking-tight transition-colors",
                      isActive(item.href) ? "text-signal" : "text-ink",
                    )}
                  >
                    {item.label}
                  </Link>
                </SheetClose>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-2 pt-8">
              {site.socials.map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-sm text-ink-muted"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {home && (
        <span
          ref={bar}
          aria-hidden
          className="absolute inset-x-0 bottom-[-1px] block h-px origin-left scale-x-0 bg-signal"
        />
      )}
    </header>
  );
}

/** A link that leans toward the pointer while hovered, then settles back. */
function MagneticLink({
  href,
  active,
  children,
}: {
  href: (typeof nav)[number]["href"];
  active: boolean;
  children: React.ReactNode;
}) {
  const ref = React.useRef<HTMLAnchorElement>(null);

  const onMove = (event: React.PointerEvent<HTMLAnchorElement>) => {
    const node = ref.current;
    if (!node || event.pointerType !== "mouse") return;
    const rect = node.getBoundingClientRect();
    const dx = (event.clientX - (rect.left + rect.width / 2)) / rect.width;
    const dy = (event.clientY - (rect.top + rect.height / 2)) / rect.height;
    node.style.transform = `translate(${dx * 8}px, ${dy * 6}px)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <Link
      ref={ref}
      href={href}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative rounded-full px-4 py-2 text-sm transition-[color,transform] duration-300 ease-out",
        active ? "text-ink" : "text-ink-muted hover:text-ink",
      )}
    >
      {children}
      <span
        aria-hidden
        className={cn(
          "absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-signal transition-opacity",
          active ? "opacity-100" : "opacity-0",
        )}
      />
    </Link>
  );
}
