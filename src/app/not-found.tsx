import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/section";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  // Next already emits `noindex` for this route.
  title: "Page not found",
};

export default function NotFound() {
  return (
    <Container>
      <div className="flex min-h-[60vh] flex-col justify-center py-24">
        <p className="eyebrow tabular">404</p>
        <h1 className="mt-6 max-w-[16ch] font-display text-display">
          That page is not here.
        </h1>
        <p className="mt-6 max-w-[48ch] text-lead text-ink-muted">
          It may have moved when I rebuilt this site, or it may never have
          existed. Either way, the front page is a good place to restart.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/" className={buttonVariants({ variant: "solid" })}>
            Back home
          </Link>
          <Link href="/work" className={buttonVariants({ variant: "outline" })}>
            See the work
          </Link>
        </div>
      </div>
    </Container>
  );
}
