import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/metadata";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/icons";
import { Container, Section } from "@/components/section";
import { Reveal } from "@/components/reveal";
import { Prose } from "@/components/prose";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = pageMetadata({
  title: "A worked example",
  description:
    "What it looks like when a team's approvals live in a spreadsheet and an inbox, and what replaces them. An illustrative build, start to finish.",
  path: "/build/example/",
});

const before = [
  "The week's shifts live in a shared spreadsheet. Two people edit it. Nobody is sure which copy is current.",
  "Swap requests arrive by email and text. The coordinator reconciles them by hand on Thursday night.",
  "Double-bookings and short rests are found on the day, by the person who turns up to an empty desk.",
  "There is no record of who approved what, so every dispute is a memory contest.",
];

const build = [
  {
    title: "The week, as a board",
    body: "Shifts are laid on a week by dragging. Overlaps, short rests, hours without cover and over-hours are flagged the moment they happen, not on Thursday. Shift, on the Work page, is the working sketch of it.",
    href: "/work/shift" as const,
    link: "Try the board in Shift",
  },
  {
    title: "Rule-checked swaps, one click",
    body: "A swap that breaks no rule goes through on one click and is logged. One that would leave a gap goes to the coordinator with the gap already highlighted.",
  },
  {
    title: "One source of truth, in the tools people already open",
    body: "The week exports to everyone's calendar. Sign-in uses the accounts the team already has. The spreadsheet retires.",
  },
  {
    title: "A counter, from day one",
    body: "The first thing built is the measurement: conflicts caught before the day, hours the coordinator spends on the roster, requests approved without a conversation. The numbers are yours to read, not mine to promise.",
  },
];

const after = [
  "A bad swap is refused before it is saved. Nobody finds it at an empty desk.",
  "One week exists. It is the one on everyone's calendar.",
  "Every dispute ends in ten seconds: who approved it, when, and why.",
  "The coordinator's Thursday night is a Thursday night.",
];

const weekOne = [
  { when: "Day 2", what: "A live URL with your real roster on it." },
  { when: "Day 5", what: "The counter running against last month's spreadsheet." },
  { when: "Week 2", what: "The team drags shifts. You watch what breaks, and it gets fixed that day." },
  { when: "Week 3", what: "Calendars, sign-in, handover. The spreadsheet is switched off." },
];

export default function ExamplePage() {
  return (
    <>
      <Container>
        <div className="pt-12 pb-6 sm:pt-16">
          <Link
            href="/build"
            className="link-underline inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink"
          >
            <ArrowLeftIcon aria-hidden className="size-4" />
            Build
          </Link>
          <p className="label mt-10">A worked example</p>
          <h1 className="mt-6 max-w-[16ch] font-display text-display">
            One workflow, start to finish.
          </h1>
          <Prose className="mt-8 text-lead">
            <p>
              This is an illustration, not a client story. If your team runs a
              roster, a queue or an approvals list out of a spreadsheet and an
              inbox, the shape will be familiar. Here is what gets built and
              what changes.
            </p>
          </Prose>
        </div>
      </Container>

      <Section
        title="Before"
        lede="A team of a dozen, one coordinator, one very important spreadsheet."
      >
        <ul className="rail-list grid gap-px sm:grid-cols-2">
          {before.map((line, i) => (
            <Reveal key={line} as="li" delay={i * 60} className="border-t border-line py-6 sm:pr-10">
              <span className="label tabular">0{i + 1}</span>
              <p className="mt-3 max-w-[44ch] text-body text-ink-muted">{line}</p>
            </Reveal>
          ))}
        </ul>
      </Section>

      <Section
        title="What gets built"
        lede="A small internal app. Two to three weeks from the first call to the team using it."
      >
        <ol className="rail-list grid gap-10 lg:grid-cols-2 lg:gap-x-16">
          {build.map((step, i) => (
            <Reveal key={step.title} as="li" delay={i * 70} className="border-t border-line pt-5">
              <span className="label tabular">Step {i + 1}</span>
              <h3 className="mt-3 font-display text-2xl text-ink">{step.title}</h3>
              <p className="mt-3 max-w-[52ch] text-body text-ink-muted">{step.body}</p>
              {step.href && (
                <Link
                  href={step.href}
                  className="link-underline mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink hover:text-signal"
                >
                  {step.link}
                  <ArrowRightIcon aria-hidden className="size-4" />
                </Link>
              )}
            </Reveal>
          ))}
        </ol>
      </Section>

      <Section
        title="What you would have, and when"
        lede="No case study can give you this part. A schedule you can hold me to."
      >
        <ol className="rail-list grid gap-px sm:grid-cols-2 lg:grid-cols-4">
          {weekOne.map((item, i) => (
            <Reveal key={item.when} as="li" delay={i * 60} className="border-t border-line py-6 sm:pr-8">
              <span className="label tabular">{item.when}</span>
              <p className="mt-3 max-w-[30ch] text-body text-ink-muted">{item.what}</p>
            </Reveal>
          ))}
        </ol>
      </Section>

      <Section title="After">
        <ul className="rail-list grid gap-px sm:grid-cols-2">
          {after.map((line, i) => (
            <Reveal key={line} as="li" delay={i * 60} className="border-t border-line py-6 sm:pr-10">
              <span className="label tabular">0{i + 1}</span>
              <p className="mt-3 max-w-[44ch] text-body text-ink-muted">{line}</p>
            </Reveal>
          ))}
        </ul>
        <Link
          href="/build/#form"
          className={cn(buttonVariants({ variant: "solid", size: "lg" }), "mt-12")}
        >
          Describe your version of this
          <ArrowRightIcon aria-hidden className="size-4" />
        </Link>
      </Section>
    </>
  );
}
