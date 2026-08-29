import type { Metadata } from "next";
import { ProbationTracker } from "@/components/private/probation-tracker";

export const metadata: Metadata = { title: "Probation" };

export default function ProbationPage() {
  return <ProbationTracker />;
}
