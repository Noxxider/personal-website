import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { ToolPage } from "@/components/tool-page";
import { WeightTracker } from "@/components/tools/weight-tracker";
import { projects } from "@/content/work";

const project = projects.find((p) => p.slug === "weighttracker")!;

export const metadata: Metadata = pageMetadata({
  title: "Bodyweight Tracker",
  description:
    "Paste a run of weigh-ins and see the trend line plus average, net change, range and daily drift. Runs entirely in your browser, nothing is uploaded.",
  path: "/weighttracker/",
});

export default function WeightTrackerPage() {
  return (
    <ToolPage project={project}>
      <WeightTracker />
    </ToolPage>
  );
}
