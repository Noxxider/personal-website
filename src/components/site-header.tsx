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
import { nav, site } from "@/content/site";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-colors duration-300",
        scrolled
          ? "border-line bg-paper/85 backdrop-blur-md"
          : "border-transparent bg-paper",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="group flex items-baseline gap-2.5 rounded-sm"
          aria-label={`${site.name}, home`}
        >
          <span className="font-display text-xl leading-none tracking-tight">
            {site.name}
          </span>
          <span
            aria-hidden
            className="hidden h-1.5 w-1.5 rounded-full bg-signal transition-transform duration-300 group-hover:scale-150 sm:block"
          />
        </Link>

        <nav className="hidden items-center gap-1 sm:flex" aria-label="Main">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "rounded-full px-4 py-2 text-sm transition-colors duration-200",
                isActive(item.href)
                  ? "text-ink"
                  : "text-ink-muted hover:text-ink",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            className="-mr-2 rounded-full p-2 text-ink transition-colors hover:bg-paper-sunken sm:hidden"
            aria-label="Open menu"
          >
            <MenuIcon className="size-5" />
          </SheetTrigger>
          <SheetContent aria-describedby={undefined}>
            <SheetTitle className="eyebrow">Menu</SheetTitle>
            <nav className="mt-10 flex flex-col" aria-label="Mobile">
              {[{ label: "Home", href: "/" } as const, ...nav].map((item) => (
                <SheetClose asChild key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={cn(
                      "border-b border-line py-4 font-display text-3xl transition-colors",
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
