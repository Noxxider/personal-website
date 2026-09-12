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
  return (
    <article className="group relative flex h-full flex-col rounded-2xl border border-line bg-surface p-5 transition-colors duration-300 hover:border-line-strong sm:p-6">
      {project.image && (
        <div className="overflow-hidden rounded-lg border border-ink/10 bg-ground">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.image.src}
            alt={project.image.alt}
            width={project.image.width}
            height={project.image.height}
            loading="lazy"
            className={cn(
              "w-full object-cover object-left-top opacity-85 transition-[opacity,transform] duration-500 group-hover:scale-[1.02] group-hover:opacity-100",
              large ? "aspect-[16/8]" : "aspect-[16/10]",
            )}
          />
        </div>
      )}
      <div className="mt-5 flex items-center justify-between">
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
          "mt-3 font-display text-ink",
          large ? "text-[2.25rem] leading-none sm:text-[2.75rem]" : "text-[1.75rem] leading-tight",
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
      <p className="mt-2.5 max-w-[46ch] text-[0.9375rem] leading-relaxed text-ink-muted">
        {project.blurb}
      </p>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
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
    </article>
  );
}
