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

/**
 * On the home page the header is part of the film: a six-segment chapter
 * rail lights up as the film plays, read
 * straight from the shared scroll state on each frame. Nav links are
 * magnetic, leaning a few pixels toward the pointer.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const rail = React.useRef<HTMLSpanElement>(null);
  const [inFilm, setInFilm] = React.useState(false);
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
        if (p.enter > 0.5) current = id;
        filled += Math.min(1, p.enter) + p.pin;
      }
      const past = progress.web.exit >= 0.98;
      // Only the hero gets the soft mask; from the Canada zoom on the header
      // is solid so nothing on the canvas ever draws through the chrome.
      const overIce = progress.canada.enter > 0.6;
      const index = past ? chapterIds.length : chapterIds.indexOf(current);
      const key = `${index}:${past}:${overIce}`;
      if (key !== last) {
        last = key;
        setInFilm(!past && !overIce);
        if (rail.current) rail.current.style.opacity = past ? "0" : "1";
        rail.current?.querySelectorAll("i").forEach((segment, i) => {
          segment.style.opacity = i < index ? "0.45" : i === index ? "1" : "0.15";
        });
      }
      void filled;
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [home]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-colors duration-300",
        home && inFilm
          ? "header-mask border-b border-transparent bg-transparent"
          : scrolled
            ? "border-b border-line bg-ground/95"
            : "border-b border-transparent bg-transparent",
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
            ref={rail}
            aria-hidden
            className="pointer-events-none absolute left-1/2 hidden -translate-x-1/2 gap-1.5 transition-opacity duration-500 md:flex"
          >
            {chapterIds.map((id) => (
              <i
                key={id}
                className="block h-0.5 w-7 rounded-full bg-signal transition-opacity duration-500"
                style={{ opacity: id === "arrival" ? 1 : 0.15 }}
              />
            ))}
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
