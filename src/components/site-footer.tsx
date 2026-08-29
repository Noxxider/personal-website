import Link from "next/link";
import { nav, site } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-line">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          <div>
            <p className="font-display text-2xl">{site.name}</p>
            <p className="mt-2 text-sm text-ink-muted">
              {site.role}, {site.location}
            </p>
            <a
              href={`mailto:${site.email}`}
              className="link-underline mt-4 inline-block text-sm text-ink"
            >
              {site.email}
            </a>
          </div>

          <div className="flex gap-14">
            <nav aria-label="Footer">
              <p className="eyebrow">Site</p>
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
              <p className="eyebrow">Elsewhere</p>
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

        <p className="eyebrow mt-14">
          &copy; {new Date().getFullYear()} {site.name}
        </p>
      </div>
    </footer>
  );
}
