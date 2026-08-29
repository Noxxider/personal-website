import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { Container, Section } from "@/components/section";
import { Reveal } from "@/components/reveal";
import { WorkCard } from "@/components/work-card";
import { Prose } from "@/components/prose";
import { education, projects, roles } from "@/content/work";

export const metadata: Metadata = pageMetadata({
  title: "Work",
  description:
    "Tools I have built and shipped, the roles behind them, and where I studied. Bodyweight Tracker, Tap BPM, clinical scheduling systems and earlier product work.",
  path: "/work/",
});

export default function WorkPage() {
  return (
    <>
      <Container>
        <div className="pt-16 pb-6 sm:pt-24">
          <div>
            <p className="eyebrow">Work</p>
            <h1 className="mt-6 max-w-[18ch] font-display text-display">
              Things I have built and kept running.
            </h1>
            <Prose className="mt-8 text-lead">
              <p>
                Two of these are live on this site, so you can use them rather
                than read about them. The rest is the employment history behind
                the habits.
              </p>
            </Prose>
          </div>
        </div>
      </Container>

      <Section index="01" eyebrow="Projects">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {projects.map((project, i) => (
            <Reveal key={project.slug} delay={i * 90} className="flex">
              <WorkCard project={project} className="w-full" />
            </Reveal>
          ))}
        </div>
      </Section>

      <Section index="02" eyebrow="Experience">
        <ol className="grid gap-0">
          {roles.map((role, i) => (
            <Reveal
              key={`${role.organisation}-${role.period}`}
              as="li"
              delay={i * 60}
              className="grid gap-3 border-t border-line py-8 sm:grid-cols-[9rem_1fr] sm:gap-10"
            >
              <p className="font-mono text-[0.8125rem] text-ink-faint tabular">
                {role.period}
              </p>
              <div>
                <h3 className="text-lg font-medium text-ink">
                  {role.title}
                  <span className="text-ink-faint">, </span>
                  <span className="text-ink-muted">{role.organisation}</span>
                  {role.current && (
                    <span className="ml-3 inline-flex translate-y-[-2px] items-center gap-1.5 rounded-full bg-signal-soft px-2.5 py-0.5 font-mono text-[0.625rem] tracking-wider text-signal uppercase">
                      <span aria-hidden className="size-1.5 rounded-full bg-signal" />
                      Current
                    </span>
                  )}
                </h3>
                <p className="mt-2.5 max-w-[62ch] text-[0.9375rem] leading-relaxed text-ink-muted">
                  {role.summary}
                </p>
              </div>
            </Reveal>
          ))}
        </ol>
      </Section>

      <Section index="03" eyebrow="Education and certification">
        <ol>
          {education.map((item, i) => (
            <Reveal
              key={item.title}
              as="li"
              delay={i * 60}
              className="grid gap-3 border-t border-line py-8 sm:grid-cols-[9rem_1fr] sm:gap-10"
            >
              <p className="font-mono text-[0.8125rem] text-ink-faint tabular">
                {item.period}
              </p>
              <div>
                <h3 className="text-lg font-medium text-ink">{item.title}</h3>
                <p className="mt-1.5 text-[0.9375rem] text-ink-muted">
                  {item.organisation}
                </p>
              </div>
            </Reveal>
          ))}
        </ol>
      </Section>
    </>
  );
}
