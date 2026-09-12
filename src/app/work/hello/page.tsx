import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { ToolPage } from "@/components/tool-page";
import { HelloGlobe } from "@/components/apps/hello-globe";
import { projects } from "@/content/work";
import { getHellos } from "./actions";

const project = projects.find((p) => p.slug === "hello")!;

export const metadata: Metadata = pageMetadata({
  title: "Hello from",
  description:
    "Leave a light on a shared globe from wherever you are. Country only; nothing else is read or kept.",
  path: "/work/hello/",
});

/** Reads the database on each request; the only public route that does. */
export const dynamic = "force-dynamic";

export default async function HelloPage() {
  const { hellos, connected } = await getHellos();
  return (
    <ToolPage project={project}>
      <HelloGlobe initial={hellos} connected={connected} />
    </ToolPage>
  );
}
