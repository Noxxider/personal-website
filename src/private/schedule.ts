import "server-only";

/**
 * Personal immigration history.
 *
 * The `server-only` import above is load bearing: it makes the build fail if
 * this module is ever pulled into a client component, which would put these
 * dates into a public JavaScript chunk. Anything here reaches the browser only
 * as props on a page under /private, and that path is behind Basic Auth.
 */

export type Milestone = {
  /** YYYY-MM-DD. */
  date: string;
  label: string;
  detail?: string;
};

/** The permanent residence application, start to finish. */
export const prMilestones: Milestone[] = [
  {
    date: "2025-04-05",
    label: "Application filed",
    detail: "BC PNP, non Express Entry",
  },
  {
    date: "2026-02-06",
    label: "Acknowledgement of receipt",
    detail: "Ten months in the queue",
  },
  { date: "2026-03-16", label: "Portal 1" },
  { date: "2026-03-19", label: "Portal 2", detail: "Three days later" },
  {
    date: "2026-05-04",
    label: "Confirmation of PR",
    detail: "Permanent resident from this day",
  },
  { date: "2026-07-02", label: "PR card in hand" },
];

/** The day permanent residence started, which anchors the citizenship count. */
export const prDate = "2026-05-04";

export type Absence = {
  id: string;
  /** Day of departure. Counts as a day in Canada. */
  from: string;
  /** Day of return. Counts as a day in Canada. */
  to: string;
  note?: string;
};

/**
 * Known time outside Canada. Seeds the tracker on a device that has not been
 * used before; anything added in the browser is kept in localStorage from then
 * on. Add trips here to make them permanent across devices.
 */
export const knownAbsences: Absence[] = [
  { id: "2025-01-02", from: "2025-01-02", to: "2025-01-22", note: "Away" },
];

/**
 * Prompts kept alongside the episode log for clinical discussion. Server-only
 * for the same reason as the history above.
 */
export const episodeQuestions: string[] = [
  "Could dysautonomia, vasomotor instability or small fibre neuropathy explain nocturnal leg erythema with burning pain?",
  "Is there value in autonomic testing, for example a tilt table, or a skin biopsy for small fibres?",
  "Cooling versus warming strategies during an episode: which is worth trying?",
  "Any medication adjustments, in dose or timing, that would blunt the overnight episodes?",
  "What are the red flags that would make this an emergency department visit rather than home care?",
];
