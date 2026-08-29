import type { Metadata } from "next";
import { ToolPage } from "@/components/tool-page";
import { TapBpm } from "@/components/tools/tap-bpm";
import { projects } from "@/content/work";

const project = projects.find((p) => p.slug === "tapbpm")!;

export const metadata: Metadata = {
  title: "Tap BPM",
  description:
    "Tap along to a song or a pulse and read the tempo in beats per minute, averaged over your last eight taps. Works with touch, mouse and keyboard.",
  alternates: { canonical: "/tapbpm" },
  openGraph: {
    title: "Tap BPM",
    description:
      "Tap along to a song or a pulse and read the tempo in beats per minute.",
    url: "/tapbpm",
  },
};

export default function TapBpmPage() {
  return (
    <ToolPage project={project}>
      <TapBpm />
    </ToolPage>
  );
}
