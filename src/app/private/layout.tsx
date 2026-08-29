import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/section";
import { PrivateNav } from "@/components/private/private-nav";

export const metadata: Metadata = {
  title: { default: "Private", template: "%s · Private" },
  robots: { index: false, follow: false, nocache: true },
};

/** Nothing under here is prerendered or cached. */
export const dynamic = "force-dynamic";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Container>
      <div className="py-10 sm:py-14">
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-line pb-5">
          <div>
            <p className="label">Private</p>
            <p className="mt-1.5 text-[0.9375rem] text-ink-muted">
              Not linked, not indexed, password only.
            </p>
          </div>
          <Link
            href="/"
            className="link-underline text-sm text-ink-muted hover:text-ink"
          >
            Back to the public site
          </Link>
        </div>

        <PrivateNav />

        <div className="mt-10">{children}</div>
      </div>
    </Container>
  );
}
