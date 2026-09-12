"use client";

import dynamic from "next/dynamic";

const BuildScene = dynamic(() => import("./build-scene").then((m) => m.BuildScene), { ssr: false });

/** The Build structure, fully assembled, beside the offer on the home page. */
export function OfferScene() {
  return (
    <div aria-hidden className="relative h-64 sm:h-80 lg:h-full lg:min-h-[22rem]">
      <BuildScene assembled />
    </div>
  );
}
