import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { Container, Section } from "@/components/section";
import { Reveal } from "@/components/reveal";
import { Prose } from "@/components/prose";
import { capabilities, education, roles } from "@/content/work";
import { site } from "@/content/site";

export const metadata: Metadata = pageMetadata({
  title: "Experience",
  description:
    "Ravino Juwono: clinical informatics analyst, physics graduate, software developer. The roles, what each one actually involved, and how I work.",
  path: "/experience/",
});

export default function ExperiencePage() {
  return (
    <>
      <Container>
        <div className="pt-16 pb-6 sm:pt-24">
          <p className="label">Experience</p>
          <h1 className="mt-6 max-w-[16ch] font-display text-display">
            Physics first, then software.
          </h1>
          <Prose className="mt-8 text-lead">
            <p>
              A degree in physics, a few years shipping products, and now the
              scheduling systems a health region books its appointments
              through.
            </p>
          </Prose>
        </div>
      </Container>

      <Section title="Roles">
        <ol className="grid gap-0">
          {roles.map((role, i) => (
            <Reveal
              key={`${role.organisation}-${role.period}`}
              as="li"
              delay={i * 60}
              className="grid gap-3 border-t border-line py-8 sm:grid-cols-[10rem_1fr] sm:gap-10"
            >
              <p className="label tabular pt-1.5">{role.period}</p>
              <div>
                <h3 className="font-display text-2xl text-ink">
                  {role.title}
                  <span className="text-ink-faint">, </span>
                  <span className="text-ink-muted">{role.organisation}</span>
                  {role.current && (
                    <span className="ml-3 inline-flex translate-y-[-3px] items-center gap-1.5 rounded-full bg-signal-soft px-2.5 py-0.5 font-mono text-[0.625rem] tracking-wider text-signal uppercase">
                      <span aria-hidden className="size-1.5 rounded-full bg-signal" />
                      Now
                    </span>
                  )}
                </h3>
                <p className="mt-3 max-w-[62ch] text-body text-ink-muted">
                  {role.summary}
                </p>
              </div>
            </Reveal>
          ))}
        </ol>
      </Section>

      <Section title="How I got here">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
          <Reveal>
            <Prose className="text-ink/85">
              <p>
                I studied physics at the University of British Columbia, which
                mostly taught me how to sit with a problem I do not understand
                yet. The programming started as a way to get through problem
                sets, then took over.
              </p>
              <p>
                Since 2024 I have been a clinical informatics analyst at{" "}
                {site.employer}, working on the scheduling module that clinics
                across the region use to book patients. Healthcare software is
                unglamorous and deeply constrained, and it is the best training
                I have had. Nothing sharpens your sense of edge cases like a
                system where an edge case is a person who does not get seen.
              </p>
              <p>
                Before that I built and shipped products: an event discovery
                platform with a live map and ticketing, a white label ticketing
                site, a social analytics tool for a small team, and API work in
                C# during an internship. The through line is that I like owning
                something end to end, from the data model out to whether it
                feels good on a phone.
              </p>
              <p>
                Outside of work I sing. I was in an acapella club through
                university and it is still the fastest way I know to stop
                thinking about software for an hour.
              </p>
            </Prose>
          </Reveal>

          <Reveal delay={120} className="space-y-10">
            <div className="border-t border-line pt-5">
              <h3 className="label">How I work</h3>
              <ul className="mt-4 space-y-3.5 text-[0.9375rem] leading-relaxed text-ink-muted">
                <li>Measure first. Then decide. Then change one thing.</li>
                <li>Ship the smallest honest version, then make it good under real use.</li>
                <li>Static and server rendered by default. Client JavaScript earns its place.</li>
                <li>Accessibility and keyboard behaviour are part of the feature, not a pass at the end.</li>
                <li>Test the paths that would actually embarrass you if they broke.</li>
              </ul>
            </div>

            <div className="border-t border-line pt-5">
              <h3 className="label">Education</h3>
              <ul className="mt-4 space-y-4">
                {education.map((item) => (
                  <li key={item.title}>
                    <p className="text-[0.9375rem] text-ink">{item.title}</p>
                    <p className="label mt-1">
                      {item.organisation} · {item.period}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </Section>

      <Section title="What I work with">
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 lg:grid-cols-4">
          {capabilities.map((group, i) => (
            <Reveal key={group.group} delay={i * 70} className="border-t border-line pt-5">
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
    </>
  );
}
