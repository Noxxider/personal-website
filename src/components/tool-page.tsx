import Link from "next/link";
import { ArrowLeftIcon, ArrowUpRightIcon } from "@/components/icons";
import { Container } from "@/components/section";
import { Prose } from "@/components/prose";
import type { Project } from "@/content/work";

/** Shared shell for the two live tools: the tool first, the notes underneath. */
export function ToolPage({
  project,
  children,
}: {
  project: Project;
  children: React.ReactNode;
}) {
  return (
    <Container>
      <div className="py-12 sm:py-16">
        <Link
          href="/work"
          className="link-underline inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink"
        >
          <ArrowLeftIcon aria-hidden className="size-4" />
          Work
        </Link>

        <h1 className="mt-8 font-display text-title">{project.title}</h1>
        <p className="mt-3 max-w-[58ch] text-[1.0625rem] leading-relaxed text-ink-muted">
          {project.blurb}
        </p>

        <div className="mt-12">{children}</div>

        <div className="mt-20 grid gap-10 border-t border-line pt-10 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
          <div>
            <h2 className="eyebrow">Notes</h2>
            <Prose className="mt-5">
              <p>{project.description}</p>
            </Prose>
          </div>
          <div className="space-y-10">
            <div>
              <h2 className="eyebrow">Built with</h2>
              <ul className="mt-4 space-y-2">
                {project.stack.map((tech) => (
                  <li key={tech} className="text-[0.9375rem] text-ink-muted">
                    {tech}
                  </li>
                ))}
              </ul>
            </div>
            {project.repo && (
              <div>
                <h2 className="eyebrow">Source</h2>
                <a
                  href={project.repo}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="link-underline mt-4 inline-flex items-center gap-1.5 text-[0.9375rem] text-ink"
                >
                  {project.repo.replace("https://github.com/", "")}
                  <ArrowUpRightIcon aria-hidden className="size-4" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}
