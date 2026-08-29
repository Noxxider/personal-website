import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { Container, Section } from "@/components/section";
import { Reveal } from "@/components/reveal";
import { Prose } from "@/components/prose";
import { site } from "@/content/site";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description:
    "Physics graduate turned software developer, now working in clinical informatics in Kelowna, British Columbia. How I got here and how I like to build.",
  path: "/about/",
});

export default function AboutPage() {
  return (
    <>
      <Container>
        <div className="pt-16 pb-6 sm:pt-24">
          <p className="eyebrow">About</p>
          <h1 className="mt-6 max-w-[16ch] font-display text-display">
            Physics first, then software.
          </h1>
        </div>
      </Container>

      <Section index="01" eyebrow="The short version">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
          <Reveal>
            <Prose>
              <p>
                I studied physics at UBC Okanagan, which mostly taught me how to
                sit with a problem I do not understand yet. The programming
                started as a way to get through problem sets, then took over.
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
                C# during an internship in Jakarta. The through line is that I
                like owning something end to end, from the data model out to
                whether it feels good on a phone.
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
              <h2 className="eyebrow">How I like to build</h2>
              <ul className="mt-4 space-y-3.5 text-[0.9375rem] leading-relaxed text-ink-muted">
                <li>
                  Ship the smallest honest version, then make it good under real
                  use.
                </li>
                <li>
                  Static and server rendered by default. Client JavaScript needs
                  to earn its place.
                </li>
                <li>
                  Accessibility and keyboard behaviour are part of the feature,
                  not a pass at the end.
                </li>
                <li>
                  Test the paths that would actually embarrass you if they
                  broke.
                </li>
              </ul>
            </div>

            <div className="border-t border-line pt-5">
              <h2 className="eyebrow">Elsewhere</h2>
              <ul className="mt-4 space-y-3">
                {site.socials.map((s) => (
                  <li key={s.href}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="link-underline text-[0.9375rem] text-ink"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}

              </ul>
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
