import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { ToolPage } from "@/components/tool-page";
import { ShiftBoard } from "@/components/apps/shift-board";
import { projects } from "@/content/work";

const project = projects.find((p) => p.slug === "shift")!;

export const metadata: Metadata = pageMetadata({
  title: "Shift",
  description:
    "Drop shifts on a week and it flags double-bookings, short rests and coverage gaps as you go, then exports the week as an iCalendar file.",
  path: "/work/shift/",
});

export default function ShiftPage() {
  return (
    <ToolPage project={project}>
      <ShiftBoard />
    </ToolPage>
  );
}
