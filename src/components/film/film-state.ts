/**
 * Shared, frame-rate-friendly state for the home page film.
 *
 * Plain mutable objects rather than React state: ScrollTrigger writes here on
 * every scroll event and the 3D scenes read it on every frame. Nothing here
 * causes a re-render. The one exception is the loading status, which the
 * loader overlay subscribes to through useSyncExternalStore.
 */

export type ChapterProgress = {
  /** 0 to 1 while the chapter's stage slides up into the viewport. */
  enter: number;
  /** 0 to 1 while the stage is pinned. */
  pin: number;
  /** 0 to 1 while the stage slides away off the top. */
  exit: number;
};

export const chapterIds = [
  "arrival",
  "canada",
  "systems",
  "physics",
  "web",
  "off-the-clock",
  "elsewhere",
] as const;

export type ChapterId = (typeof chapterIds)[number];

export const progress: Record<ChapterId, ChapterProgress> = Object.fromEntries(
  chapterIds.map((id) => [id, { enter: 0, pin: 0, exit: 0 }]),
) as Record<ChapterId, ChapterProgress>;

/** Pointer position in normalised device coordinates, -1 to 1, y up. */
export const pointer = { x: 0, y: 0, active: false };

/** How much of a chapter is "on stage": 0 before it arrives, 1 while pinned,
 * back to 0 once it has slid away. */
export function presence(id: ChapterId) {
  const p = progress[id];
  return Math.min(p.enter, 1 - p.exit);
}

// --- Loading -----------------------------------------------------------------

type Loading = { fraction: number; done: boolean };
let loading: Loading = { fraction: 0, done: false };
const listeners = new Set<() => void>();

export function setLoading(next: Partial<Loading>) {
  loading = { ...loading, ...next };
  listeners.forEach((l) => l());
}

export function subscribeLoading(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getLoading() {
  return loading;
}
