import Link from "next/link";
import type { Route } from "next";
import { ArrowUpRightIcon } from "lucide-react";
import type { Project } from "@/content/work";
import { cn } from "@/lib/utils";

/**
 * The whole card is clickable via a stretched pseudo element on the title
 * link, so there is exactly one link in the tab order per card.
 */
export function WorkCard({
  project,
  className,
}: {
  project: Project;
  className?: string;
}) {
  const external = !project.href.startsWith("/");
  const stretch = "after:absolute after:inset-0 after:content-['']";

  return (
    <article
      className={cn(
        "group relative flex flex-col border-t border-line pt-6 transition-colors duration-300 hover:border-ink",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <span className="eyebrow tabular">{project.year}</span>
        <span className="eyebrow flex items-center gap-1.5">
          {project.status === "Live" && (
            <span aria-hidden className="size-1.5 rounded-full bg-signal" />
          )}
          {project.status}
        </span>
      </div>

      <h3 className="mt-5 font-display text-[1.75rem] leading-tight tracking-tight">
        {external ? (
          <a
            href={project.href}
            target="_blank"
            rel="noreferrer noopener"
            className={stretch}
          >
            {project.title}
          </a>
        ) : (
          <Link href={project.href as Route} className={stretch}>
            {project.title}
          </Link>
        )}
      </h3>

      <p className="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-ink-muted">
        {project.blurb}
      </p>

      <ul className="mt-6 flex flex-wrap gap-x-2 gap-y-1.5">
        {project.stack.map((tech) => (
          <li
            key={tech}
            className="rounded-full border border-line px-2.5 py-1 font-mono text-[0.6875rem] text-ink-faint"
          >
            {tech}
          </li>
        ))}
      </ul>

      <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink">
        {external ? "View source" : "Open the tool"}
        <ArrowUpRightIcon
          aria-hidden
          className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </span>
    </article>
  );
}
