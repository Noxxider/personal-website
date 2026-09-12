import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { ToolPage } from "@/components/tool-page";
import { OrbitsLab } from "@/components/apps/orbits-lab";
import { projects } from "@/content/work";

const project = projects.find((p) => p.slug === "orbits")!;

export const metadata: Metadata = pageMetadata({
  title: "Orbits",
  description:
    "A gravitational N-body lab in the browser. Switch between Euler and velocity Verlet and watch the energy drift, or fail to.",
  path: "/work/orbits/",
});

export default function OrbitsPage() {
  return (
    <ToolPage project={project}>
      <OrbitsLab />
    </ToolPage>
  );
}
