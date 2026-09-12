import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/metadata";
import { ArrowRightIcon } from "@/components/icons";
import { Container, Section } from "@/components/section";
import { Reveal } from "@/components/reveal";
import { Prose } from "@/components/prose";
import { ContactForm } from "@/components/contact-form";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = pageMetadata({
  title: "Build",
  description:
    "Want something built? Workflows automated, internal tools, integrations and MCP servers, fast public sites. Say what you need.",
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
              I build small, well-measured software for teams who are past
              what a spreadsheet can do. Below: what I take on, how it goes,
              and a form that lands in my inbox.
            </p>
          </Prose>
        </div>
      </Container>

      <Section title="What kinds of things">
        <ol className="rail-list grid gap-px sm:grid-cols-2">
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

      <Section>
        <Link
          href="/build/example"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
        >
          Read a worked example, start to finish
          <ArrowRightIcon aria-hidden className="size-4" />
        </Link>
      </Section>

      <Section
        id="form"
        title="Tell me what you need"
        lede="Three lines is enough. I read everything and reply to the address you give, usually within a couple of days."
      >
        <Reveal>
          <ContactForm extended submitLabel="Send the request" />
        </Reveal>
      </Section>
    </>
  );
}
