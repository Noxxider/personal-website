import type { Metadata } from "next";
import { EpisodesAnalytics } from "@/components/private/episodes-analytics";
import { episodeQuestions } from "@/private/schedule";

export const metadata: Metadata = { title: "Episodes" };

export default function EpisodesPage() {
  return <EpisodesAnalytics questions={episodeQuestions} />;
}
