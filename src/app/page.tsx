import Link from "next/link";
import type { Route } from "next";
import { ArrowRightIcon, ArrowUpRightIcon } from "@/components/icons";
import { Chapter } from "@/components/film/chapter";
import { FilmMotion } from "@/components/film/film-motion";
import { FilmHero } from "@/components/film/film-hero";
import { Container } from "@/components/section";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { listedProjects, roles } from "@/content/work";
import { site } from "@/content/site";

const current = roles.find((r) => r.current)!;

/** Shared type for the one-line chapter headings. */
const chapterTitle =
  "font-display text-title max-w-[22ch] text-balance text-ink";
const chapterBody =
  "mt-6 max-w-[52ch] text-body text-ink-muted [&>p+p]:mt-4";

const offers = [
  {
    title: "A workflow automated",
    body: "Approvals, reporting, compliance checks, anything a spreadsheet is currently doing badly.",
  },
  {
    title: "A tool for your team",
    body: "Internal apps, dashboards and integrations that fit how the work actually happens.",
  },
  {
    title: "A fast public site",
    body: "Real HTML at build time, small pages, accessible by default, and no loading spinner.",
  },
];

export default function HomePage() {
  return (
    <>
      <FilmMotion>
        {/* ------------------------------------------------ 00, arrival */}
        <Chapter
          id="arrival"
          index="00"
          label="Arrival"
          length={0.5}
          intro
          align="center"
          visual={<FilmHero />}
        >
          <h1
            id="arrival-title"
            className="font-display text-display text-ink"
            data-line
          >
            {site.name}
          </h1>
          <p
            className="mt-8 max-w-[34ch] text-lead text-ink-muted"
            data-line
          >
            I keep the scheduling systems a health region runs on, and I build
            small, fast tools.
          </p>
          <p className="label mt-14" data-line>
            Scroll
          </p>
        </Chapter>

        {/* --------------------------------------------------- 01, canada */}
        <Chapter
          id="canada"
          index="01"
          label="Canada"
          length={0.9}
        >
          <h2 id="canada-title" className={chapterTitle} data-line>
            Canada.
          </h2>
          <div className={chapterBody}>
            <p data-line>
              Where I live and work. That is as close as this page zooms in.
            </p>
          </div>
        </Chapter>

        {/* -------------------------------------------------- 02, systems */}
        <Chapter
          id="systems"
          index="02"
          label="Systems"
          length={0.9}
        >
          <h2 id="systems-title" className={cn(chapterTitle, "mt-6 sm:mt-0")} data-line>
            {current.title} at {current.organisation}.
          </h2>
          <div className={chapterBody}>
            <p data-line>
              I keep the scheduling software a health region of{" "}
              <em className="font-display text-[1.15em] text-ink not-italic">
                about a million people
              </em>{" "}
              books its appointments through: configuration, debugging, release
              testing, and direct support for the clinical staff who depend on
              it every day.
            </p>
            <p data-line>
              It is a good place to learn what software looks like when the
              stakes are real. People notice immediately when a clinic cannot
              book a patient.
            </p>
          </div>
        </Chapter>

        {/* -------------------------------------------------- 03, physics */}
        <Chapter id="physics" index="03" label="Physics" length={0.7}>
          <h2 id="physics-title" className={chapterTitle} data-line>
            I studied physics. It left me with one habit: measure, then decide.
          </h2>
          <div className={chapterBody}>
            <p data-line>
              The degree taught me to sit with a problem I did not understand
              yet. The programming started as a way through problem sets and
              never stopped. Most of what I do now is the same move: instrument
              it, look at the numbers, then change one thing.
            </p>
          </div>
        </Chapter>

        {/* ------------------------------------------------------ 04, web */}
        <Chapter id="web" index="04" label="Web" length={0.45}>
          <h2 id="web-title" className={chapterTitle} data-line>
            Small, fast pages that are real HTML before any JavaScript runs.
          </h2>
          <ul className="mt-6 grid max-w-3xl grid-cols-2 gap-x-6 gap-y-3 sm:mt-8 lg:grid-cols-4">
            {listedProjects.slice(0, 4).map((project) => (
              <li
                key={project.slug}
                className="border-t border-line pt-3 pr-4 sm:pt-4"
                data-line
              >
                <Link
                  href={
                    (project.href.startsWith("/") ? project.href : "/work") as Route
                  }
                  className="group inline-flex items-center gap-1.5 font-display text-xl text-ink hover:text-signal sm:text-2xl"
                >
                  {project.title}
                  <ArrowUpRightIcon
                    aria-hidden
                    className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </Link>
                <p className="mt-1.5 hidden text-sm leading-relaxed text-ink-muted sm:block">
                  {project.blurb}
                </p>
              </li>
            ))}
          </ul>
        </Chapter>

        {/* -------------------------------------------------- 05, symbols */}
        <Chapter
          id="elsewhere"
          index="05"
          label="Elsewhere"
          length={0.4}
          align="center"
        >
          <h2 id="elsewhere-title" className="sr-only">
            Elsewhere
          </h2>
          <ul className="grid grid-cols-2 gap-4 sm:gap-8">
            {site.socials.map((s) => (
              <li key={s.href} data-line className="flex justify-center">
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group inline-flex items-baseline gap-2 font-display text-[clamp(2rem,1rem+4vw,4.5rem)] leading-none text-ink transition-colors hover:text-signal sm:gap-3"
                >
                  {s.label}
                  <ArrowUpRightIcon
                    aria-hidden
                    className="size-6 translate-y-0.5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5 sm:size-8"
                  />
                </a>
              </li>
            ))}
          </ul>
        </Chapter>
      </FilmMotion>

      {/* ------------------------------------------------------ 06, the offer */}
      <section
        aria-labelledby="offer-title"
        className="relative overflow-hidden border-t border-line bg-ground"
      >
        <Container className="relative py-24 sm:py-32">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
            <div>
              <p className="label">06 / The offer</p>
              <h2
                id="offer-title"
                className="mt-6 max-w-[14ch] font-display text-display text-ink"
              >
                Want something built?
              </h2>
              <p className="mt-6 max-w-[40ch] text-lead text-ink-muted">
                Fixed price, agreed before any work starts. Delivered in weeks,
                not quarters, with a month of support after.
              </p>
              <Link
                href="/build"
                className={cn(buttonVariants({ variant: "solid", size: "lg" }), "mt-10")}
              >
                Say what you need
                <ArrowRightIcon aria-hidden className="size-4" />
              </Link>
            </div>
            <ul className="grid gap-8">
              {offers.map((offer, i) => (
                <li
                  key={offer.title}
                  className="group relative border-t border-line pt-5"
                >
                  <span className="label tabular">0{i + 1}</span>
                  <h3 className="mt-3 font-display text-2xl text-ink">{offer.title}</h3>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-muted">
                    {offer.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>
    </>
  );
}
