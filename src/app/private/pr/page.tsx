import type { Metadata } from "next";
import { PrStatus } from "@/components/private/pr-status";
import { knownAbsences, prDate, prMilestones } from "@/private/schedule";

export const metadata: Metadata = { title: "PR" };

export default function PrPage() {
  // The history is read on the server and handed over as props, so none of it
  // ends up in a publicly fetchable JavaScript chunk.
  return (
    <PrStatus
      milestones={prMilestones}
      prDate={prDate}
      knownAbsences={knownAbsences}
    />
  );
}
