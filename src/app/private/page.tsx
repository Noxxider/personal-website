import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";

const tools = [
  {
    href: "/private/pr",
    title: "Permanent residence",
    description:
      "The application timeline start to finish, plus physical presence toward citizenship and a record of time spent outside Canada.",
  },
  {
    href: "/private/probation",
    title: "Probation tracker",
    description:
      "Progress through a probation period, counted in working days rather than calendar days.",
  },
  {
    href: "/private/episodes",
    title: "Episodes",
    description:
      "Loads a spreadsheet of episodes and summarises timing, frequency and gaps. Everything is parsed in the browser.",
  },
] as const;

export default function PrivateIndex() {
  return (
    <div>
      <h1 className="font-display text-title">Tools</h1>
      <ul className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
        {tools.map((tool) => (
          <li key={tool.href} className="group relative border-t border-line pt-5 transition-colors hover:border-ink">
            <h2 className="font-display text-2xl">
              <Link
                href={tool.href}
                className="after:absolute after:inset-0 after:content-['']"
              >
                {tool.title}
              </Link>
            </h2>
            <p className="mt-2 max-w-[46ch] text-[0.9375rem] leading-relaxed text-ink-muted">
              {tool.description}
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink">
              Open
              <ArrowRightIcon
                aria-hidden
                className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
