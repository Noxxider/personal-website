import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { pageMetadata } from "@/lib/metadata";
import { ArrowUpRightIcon } from "@/components/icons";
import { Container, Section } from "@/components/section";
import { Reveal } from "@/components/reveal";
import { Prose } from "@/components/prose";
import { listedProjects } from "@/content/work";
import { cn } from "@/lib/utils";

export const metadata: Metadata = pageMetadata({
  title: "Work",
  description:
    "Small real programs built to show range: an N-body lab, a double pendulum, a shift scheduler with conflict checks, a shared globe on Neon, and this site.",
  path: "/work/",
});

const accents: Record<string, string> = {
  orbits: "from-signal/25",
  pendulum: "from-accent/20",
  shift: "from-signal/15",
  hello: "from-signal/30",
  site: "from-ink/10",
};

export default function WorkPage() {
  const [first, ...rest] = listedProjects;
  return (
    <>
      <Container>
        <div className="pt-16 pb-6 sm:pt-24">
          <p className="label">Work</p>
          <h1 className="mt-6 max-w-[18ch] font-display text-display">
            Things you can use, not just read about.
          </h1>
          <Prose className="mt-8 text-lead">
            <p>
              Each of these is a real program with its own page and notes on
              how it is built. They are small on purpose and made to be poked
              at.
            </p>
          </Prose>
        </div>
      </Container>

      <Section>
        <div className="grid gap-5 lg:grid-cols-3">
          {first && (
            <Reveal className="lg:col-span-2">
              <Card project={first} large />
            </Reveal>
          )}
          {rest.map((project, i) => (
            <Reveal key={project.slug} delay={(i + 1) * 70}>
              <Card project={project} />
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}

function Card({
  project,
  large = false,
}: {
  project: (typeof listedProjects)[number];
  large?: boolean;
}) {
  const external = !project.href.startsWith("/");
  const stretch = "after:absolute after:inset-0 after:content-['']";
  const body = (
    <>
      <div className="flex items-center justify-between">
        <span className="label tabular">{project.year}</span>
        <span className="label flex items-center gap-1.5">
          {project.status === "Live" && (
            <span aria-hidden className="size-1.5 rounded-full bg-signal" />
          )}
          {project.status}
        </span>
      </div>
      <h2
        className={cn(
          "mt-auto font-display text-ink",
          large ? "pt-24 text-[2.5rem] leading-none sm:pt-40 sm:text-[3.25rem]" : "pt-16 text-3xl",
        )}
      >
        {external ? (
          <a href={project.href} target="_blank" rel="noreferrer noopener" className={stretch}>
            {project.title}
          </a>
        ) : (
          <Link href={project.href as Route} className={stretch}>
            {project.title}
          </Link>
        )}
      </h2>
      <p className="mt-3 max-w-[46ch] text-[0.9375rem] leading-relaxed text-ink-muted">
        {project.blurb}
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <ul className="flex flex-wrap gap-x-2 gap-y-1.5">
          {project.stack.map((tech) => (
            <li
              key={tech}
              className="rounded-full border border-line px-2.5 py-1 text-[0.75rem] text-ink-faint"
            >
              {tech}
            </li>
          ))}
        </ul>
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-ink">
          {external ? "Source" : "Open"}
          <ArrowUpRightIcon
            aria-hidden
            className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </span>
      </div>
    </>
  );

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface p-6 transition-colors duration-300 hover:border-line-strong sm:p-7",
      )}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-100",
          accents[project.slug] ?? "from-signal/15",
        )}
      />
      <div className="relative flex h-full flex-col">{body}</div>
    </article>
  );
}
