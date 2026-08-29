import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { Container, Section } from "@/components/section";
import { Reveal } from "@/components/reveal";
import { WorkCard } from "@/components/work-card";
import { Prose } from "@/components/prose";
import { buttonVariants } from "@/components/ui/button";
import { capabilities, projects, roles } from "@/content/work";
import { site } from "@/content/site";

const current = roles.find((r) => r.current)!;

const heroFacts = [
  { label: "Based", value: "Kelowna, BC" },
  { label: "Currently", value: site.employer },
  { label: "Focus", value: "Healthcare systems, web" },
];

export default function HomePage() {
  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <Container>
        <div className="pt-14 pb-10 sm:pt-20 sm:pb-14">
          <Reveal>
            <p className="eyebrow">{site.location}</p>
            <h1 className="mt-6 max-w-[15ch] font-display text-display">
              {site.name}
            </h1>
          </Reveal>

          <Reveal delay={90}>
            <Prose className="mt-8 text-lead sm:mt-10">
              <p>
                Clinical informatics analyst at {site.employer}. I keep the
                scheduling software a health region of{" "}
                <em>about a million people</em> books its appointments through,
                and I build fast, accessible tools for the web.
              </p>
            </Prose>
          </Reveal>

          <Reveal delay={160} className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/work"
              className={buttonVariants({ variant: "solid" })}
            >
              See the work
              <ArrowRightIcon aria-hidden className="size-4" />
            </Link>
            <Link
              href="/contact"
              className={buttonVariants({ variant: "outline" })}
            >
              Get in touch
            </Link>
          </Reveal>

          <Reveal
            delay={230}
            className="mt-16 grid gap-px border-t border-line pt-6 sm:grid-cols-3 sm:gap-8"
          >
            {heroFacts.map((fact) => (
              <div key={fact.label} className="py-2">
                <p className="eyebrow">{fact.label}</p>
                <p className="mt-2 text-[0.9375rem] text-ink">{fact.value}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </Container>

      {/* ----------------------------------------------------------------- Now */}
      <Section index="01" eyebrow="What I do now">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.35fr] lg:gap-16">
          <Reveal>
            <h2 className="font-display text-title text-balance">
              {current.title}
            </h2>
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
                book a patient. That habit carries into everything else I build.
              </p>
            </Prose>
          </Reveal>
        </div>
      </Section>

      {/* -------------------------------------------------------------- Work */}
      <Section index="02" eyebrow="Selected work">
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
      <Section index="03" eyebrow="What I work with">
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 lg:grid-cols-4">
          {capabilities.map((group, i) => (
            <Reveal
              key={group.group}
              delay={i * 70}
              className="border-t border-line pt-5"
            >
              <h3 className="eyebrow">{group.group}</h3>
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
      <Section index="04" eyebrow="Say hello">
        <Reveal className="max-w-3xl">
          <h2 className="font-display text-title text-balance">
            Happy to talk about healthcare systems, web performance, or anything
            you are building.
          </h2>
          <a
            href={`mailto:${site.email}`}
            className="link-underline mt-8 inline-block font-display text-2xl text-ink sm:text-3xl"
          >
            {site.email}
          </a>
        </Reveal>
      </Section>
    </>
  );
}
