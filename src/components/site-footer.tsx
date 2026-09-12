import Link from "next/link";
import { nav, site } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-line bg-surface/40">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          <div>
            <p className="font-display text-3xl tracking-tight">{site.name}</p>
            <p className="label mt-3">{site.role}</p>
            <Link
              href="/contact"
              className="link-underline mt-5 inline-block text-sm text-ink hover:text-signal"
            >
              Get in touch
            </Link>
          </div>

          <div className="flex gap-14">
            <nav aria-label="Footer">
              <p className="label">Site</p>
              <ul className="mt-4 space-y-2.5">
                <li>
                  <Link
                    href="/"
                    className="link-underline text-sm text-ink-muted hover:text-ink"
                  >
                    Home
                  </Link>
                </li>
                {nav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="link-underline text-sm text-ink-muted hover:text-ink"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <p className="label">Elsewhere</p>
              <ul className="mt-4 space-y-2.5">
                {site.socials.map((s) => (
                  <li key={s.href}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="link-underline text-sm text-ink-muted hover:text-ink"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <p className="label mt-14">
          &copy; {new Date().getFullYear()} {site.name}
        </p>
      </div>
    </footer>
  );
}
