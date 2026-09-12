import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/metadata";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/icons";
import { Container } from "@/components/section";
import { Reveal } from "@/components/reveal";
import { OfferScene } from "@/components/build/offer-scene";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = pageMetadata({
  title: "A worked example",
  description:
    "Say your team runs its roster out of a spreadsheet and an inbox. Here is what gets built, and what it saves. One screen, illustrative.",
  path: "/build/example/",
});

const beats = [
  {
    label: "Say you have",
    lines: [
      "A roster in a shared spreadsheet.",
      "Swaps by email and text.",
      "Conflicts found on the day.",
    ],
  },
  {
    label: "I build",
    lines: [
      "A week board that refuses bad shifts as they are laid.",
      "Swaps that approve themselves when no rule breaks.",
      "One current week, on everyone's calendar. Three weeks, start to finish.",
    ],
  },
  {
    label: "It saves",
    lines: [
      "The coordinator's evening, every week: roughly four hours.",
      "About two hundred hours a year, at whatever that hour costs you.",
      "Every empty desk that a caught conflict would have prevented.",
    ],
  },
];

export default function ExamplePage() {
  return (
    <Container>
      <div className="grid min-h-[calc(100svh-4rem)] items-center gap-10 py-12 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
        <div>
          <Link
            href="/build"
            className="link-underline inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink"
          >
            <ArrowLeftIcon aria-hidden className="size-4" />
            Build
          </Link>
          <p className="label mt-10">A worked example, illustrative</p>
          <h1 className="mt-5 max-w-[16ch] font-display text-title">
            A roster, a spreadsheet, an inbox. Three weeks later.
          </h1>

          <ol className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-6">
            {beats.map((beat, i) => (
              <Reveal key={beat.label} as="li" delay={i * 90} className="relative border-t border-line pt-4">
                <p className="label flex items-center gap-2">
                  <span className="tabular">{i + 1}</span>
                  <span aria-hidden className="text-line-strong">/</span>
                  {beat.label}
                </p>
                <ul className="mt-4 space-y-3">
                  {beat.lines.map((line) => (
                    <li key={line} className="text-[0.9375rem] leading-relaxed text-ink-muted">
                      {line}
                    </li>
                  ))}
                </ul>
                {i < beats.length - 1 && (
                  <ArrowRightIcon
                    aria-hidden
                    className="absolute top-4 -right-4 hidden size-4 text-ink-faint sm:block"
                  />
                )}
              </Reveal>
            ))}
          </ol>

          <p className="label mt-10 max-w-[52ch]">
            Numbers are for a team of about a dozen. Yours get measured, not
            guessed: the counter is the first thing built.
          </p>
          <Link
            href="/build/#form"
            className={cn(buttonVariants({ variant: "solid", size: "lg" }), "mt-8")}
          >
            I have something like this
            <ArrowRightIcon aria-hidden className="size-4" />
          </Link>
        </div>

        <OfferScene />
      </div>
    </Container>
  );
}
