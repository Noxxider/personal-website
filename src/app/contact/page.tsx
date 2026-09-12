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
    "Send Ravino Juwono a message. Clinical informatics analyst and software developer. LinkedIn and GitHub too.",
  path: "/contact/",
});

export default function ContactPage() {
  return (
    <>
      <Container>
        <div className="pt-14 pb-6 sm:pt-20">
          <p className="label">Contact</p>
          <h1 className="mt-6 max-w-[14ch] font-display text-display">Say hello.</h1>
          <Prose className="mt-8 text-lead">
            <p>
              Send a message and it lands in my inbox. I read everything.
              LinkedIn works too if you would rather keep it on a network.
            </p>
          </Prose>
        </div>
      </Container>

      <Section aria-label="Send a message">
        <div className="grid gap-12 lg:grid-cols-[7fr_5fr] lg:gap-20">
          <Reveal>
            <ContactForm />
          </Reveal>

          <Reveal delay={100} className="space-y-10">
            <div className="border-t border-line pt-5 lg:border-t-0 lg:pt-0">
              <h3 className="label">What to expect</h3>
              <p className="mt-4 max-w-[40ch] text-body text-ink-muted">
                A reply within a couple of days, to the address you give. If
                it is about building something, the{" "}
                <a href="/build/#form" className="text-ink underline decoration-line-strong underline-offset-4 hover:text-signal hover:decoration-signal">
                  build form
                </a>{" "}
                asks the two questions that save us a round trip.
              </p>
            </div>

            <div className="border-t border-line pt-5">
              <h3 className="label">Elsewhere</h3>
              <ul className="mt-2">
                {site.socials.map((s) => (
                  <li key={s.href}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="group flex items-center justify-between gap-6 border-b border-line py-4 transition-colors duration-300 hover:border-ink-muted"
                    >
                      <span>
                        <span className="label">{s.label}</span>
                        <span className="mt-1 block font-display text-2xl text-ink">
                          {s.href.replace(/^https:\/\/(www\.)?/, "").replace(/\/$/, "")}
                        </span>
                      </span>
                      <ArrowUpRightIcon
                        aria-hidden
                        className="size-5 shrink-0 text-ink-faint transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink"
                      />
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
