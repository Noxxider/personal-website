import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/metadata";
import { ArrowRightIcon } from "@/components/icons";
import { Container, Section } from "@/components/section";
import { Reveal } from "@/components/reveal";
import { Prose } from "@/components/prose";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = pageMetadata({
  title: "Build",
  description:
    "Want something built? Workflows automated, internal tools, integrations and MCP servers, fast public sites. A build price agreed up front, then a monthly retainer that keeps it running.",
  path: "/build/",
});

const kinds = [
  {
    title: "A workflow automated",
    body: "Approval chains, report generation, data checks, compliance checklists. Anything a spreadsheet and three people's inboxes are currently doing badly.",
  },
  {
    title: "A tool for your team",
    body: "Internal apps and dashboards shaped around how the work actually happens, with the boring parts (sign-in, audit trail, exports) done properly.",
  },
  {
    title: "An integration or MCP server",
    body: "Systems that need to talk to each other, or a safe, scoped way for a team that uses Claude or similar to reach its own data and tools.",
  },
  {
    title: "A fast public site",
    body: "Real HTML at build time, small pages, accessible by default, no loading spinner on navigation. Like this one, minus the planet if you prefer.",
  },
];

const steps = [
  {
    title: "A twenty-minute call",
    body: "You describe the problem in your words. I ask the questions that decide whether this is a week or a quarter.",
  },
  {
    title: "A written scope, with two prices",
    body: "One page: what gets built, what does not, what the build costs, and what the monthly retainer covers after. Both agreed before any work starts.",
  },
  {
    title: "Delivery in weeks",
    body: "Working software early, then iterations against real use. You see progress on a live URL, not in a status report.",
  },
  {
    title: "Kept running, on retainer",
    body: "After handover it is hosted, watched and improved every month: fixes within days, a set number of changes, a quarterly review. A longer retainer brings the build price down.",
  },
];

export default function BuildPage() {
  return (
    <>
      <Container>
        <div className="pt-16 pb-6 sm:pt-24">
          <p className="label">Build</p>
          <h1 className="mt-6 max-w-[16ch] font-display text-display">
            If you want something built, say so.
          </h1>
          <Prose className="mt-8 text-lead">
            <p>
              TypeScript first, Python where it fits, and a habit of measuring
              before deciding. Below is what I take on, how it goes, and a form
              that lands in my inbox.
            </p>
          </Prose>
        </div>
      </Container>

      <Section title="What kinds of things">
        <ol className="grid gap-px sm:grid-cols-2">
          {kinds.map((kind, i) => (
            <Reveal
              key={kind.title}
              as="li"
              delay={i * 70}
              className="border-t border-line py-7 sm:pr-10"
            >
              <span className="label tabular">0{i + 1}</span>
              <h3 className="mt-3 font-display text-2xl text-ink">{kind.title}</h3>
              <p className="mt-3 max-w-[48ch] text-body text-ink-muted">{kind.body}</p>
            </Reveal>
          ))}
        </ol>
      </Section>

      <Section title="How it goes">
        <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <Reveal
              key={step.title}
              as="li"
              delay={i * 70}
              className="relative border-t border-line pt-5"
            >
              <span className="label tabular">Step {i + 1}</span>
              <h3 className="mt-3 min-h-[3.5rem] font-display text-xl text-ink">{step.title}</h3>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-muted">
                {step.body}
              </p>
            </Reveal>
          ))}
        </ol>
        <p className="label mt-8 max-w-[60ch]">
          No prices listed here on purpose: every scope is different, and both
          numbers are agreed in writing before anything starts.
        </p>
        <Link
          href="/build/example"
          className="link-underline mt-6 inline-flex items-center gap-2 text-sm font-medium text-ink hover:text-signal"
        >
          Read a worked example, start to finish
          <ArrowRightIcon aria-hidden className="size-4" />
        </Link>
      </Section>

      <Section
        id="form"
        title="Tell me what you need"
        lede="Three lines is enough. I read everything and reply to the address you give."
      >
        <Reveal>
          <ContactForm extended submitLabel="Send the request" />
        </Reveal>
      </Section>
    </>
  );
}
