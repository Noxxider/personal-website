"use client";

import dynamic from "next/dynamic";
import { Container } from "@/components/section";
import { Prose } from "@/components/prose";
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
          <h1 className="mt-6 max-w-[16ch] font-display text-display">
            If you want something built, say so.
          </h1>
          <Prose className="mt-8 text-lead">
            <p>
              I build small, well-measured software for teams who are past
              what a spreadsheet can do. Below: what I take on, and a form
              that lands in my inbox.
            </p>
          </Prose>
        </div>
        <div aria-hidden className="relative h-[46vw] max-h-[30rem] min-h-[16rem] lg:h-[32rem]">
          <BuildScene />
        </div>
      </div>
      <BuildSceneBridge />
    </Container>
  );
}
