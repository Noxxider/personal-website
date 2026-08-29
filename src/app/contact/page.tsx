import type { Metadata } from "next";
import { ArrowUpRightIcon } from "lucide-react";
import { Container, Section } from "@/components/section";
import { Reveal } from "@/components/reveal";
import { Prose } from "@/components/prose";
import { CopyButton } from "@/components/copy-button";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Ravino Juwono by email or on LinkedIn. Based in Kelowna, British Columbia.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <Container>
        <div className="pt-16 pb-6 sm:pt-24">
          <Reveal>
            <p className="eyebrow">Contact</p>
            <h1 className="mt-6 max-w-[14ch] font-display text-display">
              Say hello.
            </h1>
            <Prose className="mt-8 text-lead">
              <p>
                Email is the surest way to reach me, and I read everything. If
                you would rather keep it on a network, LinkedIn works too.
              </p>
            </Prose>
          </Reveal>
        </div>
      </Container>

      <Section index="01" eyebrow="Direct">
        <Reveal className="max-w-2xl border-t border-line pt-6">
          <p className="eyebrow">Email</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-4">
            <a
              href={`mailto:${site.email}`}
              className="link-underline font-display text-[clamp(1.5rem,1rem+2.4vw,2.5rem)] leading-none text-ink"
            >
              {site.email}
            </a>
            <CopyButton value={site.email} label="Email address" />
          </div>
        </Reveal>

        <div className="mt-14 grid gap-0 sm:grid-cols-2">
          {site.socials.map((s, i) => (
            <Reveal key={s.href} delay={(i + 1) * 80}>
              <a
                href={s.href}
                target="_blank"
                rel="noreferrer noopener"
                className="group flex items-center justify-between gap-6 border-t border-line py-6 transition-colors duration-300 hover:border-ink sm:pr-10"
              >
                <span>
                  <span className="eyebrow">{s.label}</span>
                  <span className="mt-2 block text-[0.9375rem] text-ink">
                    {s.href.replace(/^https:\/\/(www\.)?/, "")}
                  </span>
                </span>
                <ArrowUpRightIcon
                  aria-hidden
                  className="size-5 shrink-0 text-ink-faint transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink"
                />
              </a>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section index="02" eyebrow="Where">
        <Reveal>
          <p className="font-display text-title">{site.location}</p>
          <p className="mt-3 text-[0.9375rem] text-ink-muted">
            Pacific time, give or take a daylight saving change.
          </p>
        </Reveal>
      </Section>
    </>
  );
}
