import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { ArrowUpRightIcon } from "@/components/icons";
import { Container, Section } from "@/components/section";
import { Reveal } from "@/components/reveal";
import { Prose } from "@/components/prose";
import { ContactForm } from "@/components/contact-form";
import { site } from "@/content/site";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description:
    "Reach Ravino Juwono on LinkedIn. Clinical informatics analyst and software developer.",
  path: "/contact/",
});

export default function ContactPage() {
  return (
    <>
      <Container>
        <div className="pt-14 pb-6 sm:pt-20">
          <div>
            <p className="label">Contact</p>
            <h1 className="mt-6 max-w-[14ch] font-display text-display">
              Say hello.
            </h1>
            <Prose className="mt-8 text-lead">
              <p>
                Send a message and it lands in my inbox. I read everything.
                LinkedIn works too if you would rather keep it on a network.
              </p>
            </Prose>
          </div>
        </div>
      </Container>

      <Section title="Send a message">
        <Reveal>
          <ContactForm />
        </Reveal>
      </Section>

      <Section title="Elsewhere">
        <div className="grid gap-0 sm:grid-cols-2 sm:gap-x-12">
          {site.socials.map((s, i) => (
            <Reveal key={s.href} delay={i * 80}>
              <a
                href={s.href}
                target="_blank"
                rel="noreferrer noopener"
                className="group flex items-center justify-between gap-6 border-t border-line py-6 transition-colors duration-300 hover:border-ink"
              >
                <span>
                  <span className="label">{s.label}</span>
                  <span className="mt-2 block font-display text-2xl text-ink">
                    {s.href.replace(/^https:\/\/(www\.)?/, "").replace(/\/$/, "")}
                  </span>
                </span>
                <ArrowUpRightIcon
                  aria-hidden
                  className="size-6 shrink-0 text-ink-faint transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink"
                />
              </a>
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}
