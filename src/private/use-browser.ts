"use client";

import * as React from "react";
import { pacificNow } from "./workdays";

/**
 * Hooks for values that only exist in the browser: the clock and localStorage.
 *
 * These use `useSyncExternalStore` rather than an effect that calls setState.
 * React renders the server snapshot during hydration and swaps to the client
 * snapshot afterwards, so there is no mismatch and no cascading render.
 */

const noopSubscribe = () => () => {};

/** Wraps a reader so repeated calls return a stable reference. */
function cached<T>(read: () => T): () => T {
  let last: { key: string; value: T } | null = null;
  return () => {
    const value = read();
    const key = JSON.stringify(value) ?? "";
    if (last === null || last.key !== key) last = { key, value };
    return last.value;
  };
}

/** Today in Pacific time plus the hour there, refreshed on an interval. */
export function usePacificNow(
  intervalMs = 60_000,
): { date: string; hour: number } | null {
  const getSnapshot = React.useMemo(() => cached(pacificNow), []);

  const subscribe = React.useCallback(
    (onChange: () => void) => {
      const id = window.setInterval(onChange, intervalMs);
      return () => window.clearInterval(id);
    },
    [intervalMs],
  );

  return React.useSyncExternalStore(subscribe, getSnapshot, () => null);
}

/**
 * A value backed by localStorage. The stored value is read through
 * `useSyncExternalStore`; edits live in React state and are written straight
 * back to storage, so nothing has to be synchronised in an effect.
 */
export function useStoredValue<T>(
  key: string,
  fallback: T,
  revive: (raw: string) => T | null,
): [T, (next: T) => void] {
  const getStored = React.useMemo(
    () =>
      cached<T | null>(() => {
        try {
          const raw = window.localStorage.getItem(key);
          return raw === null ? null : revive(raw);
        } catch {
          // Private windows and blocked storage both land here.
          return null;
        }
      }),
    [key, revive],
  );

  const stored = React.useSyncExternalStore(
    noopSubscribe,
    getStored,
    () => null,
  );

  const [edited, setEdited] = React.useState<{ value: T } | null>(null);

  const set = React.useCallback(
    (next: T) => {
      setEdited({ value: next });
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // Not being able to remember it is not worth interrupting the user.
      }
    },
    [key],
  );

  const clear = React.useCallback(() => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore.
    }
  }, [key]);

  const value = edited ? edited.value : (stored ?? fallback);

  // Expose clearing through the setter by resetting to the fallback.
  const setOrClear = React.useCallback(
    (next: T) => {
      if (next === fallback) {
        clear();
        setEdited({ value: fallback });
        return;
      }
      set(next);
    },
    [set, clear, fallback],
  );

  return [value, setOrClear];
}

/** Convenience wrapper for values stored as plain JSON objects. */
export function jsonRevive<T>(guard: (value: unknown) => value is T) {
  return (raw: string): T | null => {
    try {
      const parsed: unknown = JSON.parse(raw);
      return guard(parsed) ? parsed : null;
    } catch {
      return null;
    }
  };
}
