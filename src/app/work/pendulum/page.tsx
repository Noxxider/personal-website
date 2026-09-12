import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { ToolPage } from "@/components/tool-page";
import { DoublePendulum } from "@/components/apps/double-pendulum";
import { projects } from "@/content/work";

const project = projects.find((p) => p.slug === "pendulum")!;

export const metadata: Metadata = pageMetadata({
  title: "Double pendulum",
  description:
    "Two double pendulums released a thousandth of a radian apart, integrated with fourth-order Runge–Kutta, and a readout of how fast they stop agreeing.",
  path: "/work/pendulum/",
});

export default function PendulumPage() {
  return (
    <ToolPage project={project}>
      <DoublePendulum />
    </ToolPage>
  );
}
