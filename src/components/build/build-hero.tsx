"use client";

import dynamic from "next/dynamic";
import { Container } from "@/components/section";
import { BuildSceneBridge } from "./build-scene";

const BuildScene = dynamic(() => import("./build-scene").then((m) => m.BuildScene), { ssr: false });

/**
 * The Build hero: copy on the left, one object on the right. The object
 * assembles as you scroll, lifts a tier when a kind of work is hovered
 * below, and lights up as the form is filled in.
 */
export function BuildHero() {
  return (
    <Container>
      <div className="grid items-center gap-8 pt-16 pb-6 sm:pt-20 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
        <div>
          <p className="label">Build</p>
          <h1 className="mt-6 max-w-[14ch] font-display text-display">
            Want me to help with something?
          </h1>
        </div>
        <div aria-hidden className="relative h-[46vw] max-h-[30rem] min-h-[16rem] lg:h-[32rem]">
          <BuildScene />
        </div>
      </div>
      <BuildSceneBridge />
    </Container>
  );
}
