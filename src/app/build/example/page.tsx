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
    "What it looks like when a team's approvals live in a spreadsheet and an inbox, and what replaces them. An illustrative build, start to finish, with how it is priced.",
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
    body: "Shifts are laid on a week by dragging. Overlaps, short rests, hours without cover and over-hours are flagged the moment they happen, not on Thursday. The board on this site is the sketch of it.",
    href: "/work/shift" as const,
    link: "Open the sketch",
  },
  {
    title: "Requests that approve themselves, or ask",
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
  "Conflicts are caught on entry, by the software, before anyone is inconvenienced.",
  "There is exactly one current week, and everyone can see it from their own calendar.",
  "Every change has a name, a time and a reason attached.",
  "The coordinator's Thursday night is a Thursday night.",
];

const retainer = [
  "Hosting, monitoring and backups, so it stays up without anyone thinking about it.",
  "Fixes within days, not the next budget cycle.",
  "A set number of change requests a month: a new rule, a new report, a new export.",
  "A quarterly look at the counter together, and a decision about what to build next.",
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
              This is an illustration, not a client story. It follows one
              common shape of problem, a roster kept in a spreadsheet and an
              inbox, through what gets built, what changes, and how it is
              paid for.
            </p>
          </Prose>
        </div>
      </Container>

      <Section
        title="Before"
        lede="A team of a dozen, one coordinator, one very important spreadsheet."
      >
        <ul className="grid gap-px sm:grid-cols-2">
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
        <ol className="grid gap-10 lg:grid-cols-2 lg:gap-x-16">
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

      <Section title="After">
        <ul className="grid gap-px sm:grid-cols-2">
          {after.map((line, i) => (
            <Reveal key={line} as="li" delay={i * 60} className="border-t border-line py-6 sm:pr-10">
              <span className="label tabular">0{i + 1}</span>
              <p className="mt-3 max-w-[44ch] text-body text-ink-muted">{line}</p>
            </Reveal>
          ))}
        </ul>
      </Section>

      <Section
        title="How it is priced"
        lede="Two parts: a build price to get it live, and a monthly retainer that keeps it running and growing."
      >
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <h3 className="label">The build</h3>
            <Prose className="mt-4">
              <p>
                One written scope, one price, agreed before any work starts.
                It covers everything above through handover, and thirty days
                of fixes after. The price comes down when it is paired with a
                longer retainer, because the relationship is the point.
              </p>
            </Prose>
          </Reveal>
          <Reveal delay={100}>
            <h3 className="label">The retainer</h3>
            <ul className="mt-4 space-y-3.5">
              {retainer.map((line) => (
                <li key={line} className="flex gap-3 text-body text-ink-muted">
                  <span aria-hidden className="mt-3 size-1.5 shrink-0 rounded-full bg-signal" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
        <p className="label mt-10 max-w-[60ch]">
          No numbers here on purpose. Both figures depend on the scope, and
          both are in writing before anything begins.
        </p>
        <Link
          href="/build/#form"
          className={cn(buttonVariants({ variant: "solid", size: "lg" }), "mt-10")}
        >
          Describe your version of this
          <ArrowRightIcon aria-hidden className="size-4" />
        </Link>
      </Section>
    </>
  );
}
