import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";
import { Container, Section } from "@/components/section";
import { ScheduleField } from "@/components/schedule-field";
import { Reveal } from "@/components/reveal";
import { WorkCard } from "@/components/work-card";
import { Prose } from "@/components/prose";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { capabilities, projects, roles } from "@/content/work";
import { site } from "@/content/site";

const current = roles.find((r) => r.current)!;

const heroFacts = [
  { label: "Currently", value: site.employer },
  { label: "Focus", value: "Healthcare systems, web" },
  { label: "Mostly", value: "TypeScript, React, .NET" },
];

export default function HomePage() {
  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <Container>
        <div className="pt-14 pb-10 sm:pt-20 sm:pb-14">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            <div>
              <h1 className="max-w-[15ch] font-display text-display">
                {site.name}
              </h1>

              <Prose className="mt-8 text-lead">
                <p>
                  Clinical informatics analyst at {site.employer}. I keep the
                  scheduling software a health region of{" "}
                  <em>about a million people</em> books its appointments
                  through.
                </p>
              </Prose>

              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  href="/work"
                  className={buttonVariants({ variant: "solid", size: "lg" })}
                >
                  See the work
                  <ArrowRightIcon aria-hidden className="size-4" />
                </Link>
                <Link
                  href="/contact"
                  className={buttonVariants({ variant: "outline", size: "lg" })}
                >
                  Get in touch
                </Link>
              </div>
            </div>

            <ScheduleField className="aspect-[5/4] w-full sm:aspect-[3/2] lg:aspect-[4/5]" />
          </div>

          <div className="mt-16 grid gap-px border-t border-line pt-6 sm:grid-cols-3 sm:gap-8">
            {heroFacts.map((fact) => (
              <div key={fact.label} className="py-2">
                <p className="label">{fact.label}</p>
                <p className="mt-2 text-[0.9375rem] text-ink">{fact.value}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* ----------------------------------------------------------------- Now */}
      <Section title="What I do now">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.35fr] lg:gap-16">
          <Reveal>
            <h3 className="font-display text-[1.75rem] leading-tight tracking-tight text-balance sm:text-[2rem]">
              {current.title}
            </h3>
            <p className="mt-4 font-mono text-[0.8125rem] text-ink-faint">
              {current.organisation}
              <span className="mx-2 text-line-strong">/</span>
              {current.period}
            </p>
          </Reveal>
          <Reveal delay={90}>
            <Prose>
              <p>{current.summary}</p>
              <p>
                It is a good place to learn what software looks like when the
                stakes are real: people notice immediately when a clinic cannot
                book a patient. That habit carries into everything else I do.
              </p>
            </Prose>
          </Reveal>
        </div>
      </Section>

      {/* -------------------------------------------------------------- Work */}
      <Section title="Selected work">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {projects.map((project, i) => (
            <Reveal key={project.slug} delay={i * 90} className="flex">
              <WorkCard project={project} className="w-full" />
            </Reveal>
          ))}
        </div>
        <Reveal delay={240} className="mt-14">
          <Link
            href="/work"
            className="link-underline inline-flex items-center gap-2 text-sm font-medium text-ink"
          >
            Everything, including earlier roles
            <ArrowRightIcon aria-hidden className="size-4" />
          </Link>
        </Reveal>
      </Section>

      {/* ------------------------------------------------------- Capabilities */}
      <Section title="What I work with">
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 lg:grid-cols-4">
          {capabilities.map((group, i) => (
            <Reveal
              key={group.group}
              delay={i * 70}
              className="border-t border-line pt-5"
            >
              <h3 className="label">{group.group}</h3>
              <ul className="mt-4 space-y-2">
                {group.items.map((item) => (
                  <li key={item} className="text-[0.9375rem] text-ink-muted">
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ----------------------------------------------------------- Contact */}
      <Section>
        <Reveal className="max-w-3xl border-t border-line pt-8">
          <h2 className="font-display text-title text-balance">
            Always happy to talk about healthcare systems, web performance, or
            how something you are working on is put together.
          </h2>
          <Link
            href="/contact"
            className={cn(buttonVariants({ variant: "solid" }), "mt-8")}
          >
            Get in touch
            <ArrowRightIcon aria-hidden className="size-4" />
          </Link>
        </Reveal>
      </Section>
    </>
  );
}
