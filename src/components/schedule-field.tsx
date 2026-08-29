"use client";

import * as React from "react";

/**
 * The hero visual: an abstract week of appointments that fill and clear.
 *
 * It is a nod to what the day job actually is, drawn as a week view rather than
 * decoration for its own sake. Bookings take one to three consecutive slots,
 * appear near a point of pressure that drifts across the week, and release
 * again, so the field reads as a calendar under load rather than as noise.
 *
 * Canvas, because it is a few hundred shapes a frame. It pauses when scrolled
 * out of view or when the tab is hidden, and renders a single still frame for
 * anyone who asked for reduced motion.
 */

const COLUMNS = 7;
const GAP = 4;
const MAX_SPAN = 3;
/** Slots are drawn at roughly this height relative to their width. */
const SLOT_RATIO = 0.42;
const MIN_ROWS = 9;
const MAX_ROWS = 22;

/** Milliseconds between one booking and the next. */
const BOOK_EVERY = 190;
const LIFE = { fadeIn: 650, hold: 3400, fadeOut: 1500 };
const LIFE_TOTAL = LIFE.fadeIn + LIFE.hold + LIFE.fadeOut;

type Booking = { column: number; row: number; span: number; bookedAt: number };

/** Small deterministic PRNG, so the field behaves the same on every load. */
function makeRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function alphaFor(age: number): number {
  if (age < 0 || age > LIFE_TOTAL) return 0;
  if (age < LIFE.fadeIn) return 1 - (1 - age / LIFE.fadeIn) ** 3;
  if (age < LIFE.fadeIn + LIFE.hold) return 1;
  const t = (age - LIFE.fadeIn - LIFE.hold) / LIFE.fadeOut;
  return 1 - t * t;
}

function readToken(element: HTMLElement, name: string, fallback: string) {
  return getComputedStyle(element).getPropertyValue(name).trim() || fallback;
}

export function ScheduleField({ className }: { className?: string }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const random = makeRandom(20260504);

    let bookings: Booking[] = [];
    /** Row count is derived from the box so slots keep their proportions. */
    let rows = MIN_ROWS;
    /** Which slots are spoken for, so bookings never overlap. */
    let taken = new Uint8Array(COLUMNS * MAX_ROWS);

    const line = readToken(canvas, "--color-line", "#e7e3db");
    const signal = readToken(canvas, "--color-signal", "#a6432b");

    let width = 0;
    let height = 0;
    let frame = 0;
    let running = false;
    let lastBooking = 0;
    let startedAt = 0;

    function resize() {
      if (!canvas || !context) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cellWidth = (width - GAP * (COLUMNS - 1)) / COLUMNS;
      const target = Math.round(
        (height + GAP) / (cellWidth * SLOT_RATIO + GAP),
      );
      const next = Math.max(MIN_ROWS, Math.min(MAX_ROWS, target || MIN_ROWS));
      if (next !== rows) {
        rows = next;
        taken = new Uint8Array(COLUMNS * rows);
        bookings = [];
      }
    }

    function fits(column: number, row: number, span: number): boolean {
      if (row + span > rows) return false;
      for (let i = 0; i < span; i++) {
        if (taken[(row + i) * COLUMNS + column]) return false;
      }
      return true;
    }

    function claim(booking: Booking, value: number) {
      for (let i = 0; i < booking.span; i++) {
        taken[(booking.row + i) * COLUMNS + booking.column] = value;
      }
    }

    /** Prefer slots near a column that drifts back and forth over the week. */
    function book(now: number) {
      const drift = (Math.sin(now / 8000) * 0.5 + 0.5) * (COLUMNS - 1);
      let best: Booking | null = null;
      let bestScore = -Infinity;

      for (let attempt = 0; attempt < 14; attempt++) {
        const column = Math.floor(random() * COLUMNS);
        const row = Math.floor(random() * rows);
        const span = 1 + Math.floor(random() * MAX_SPAN);
        if (!fits(column, row, span)) continue;
        const score = -Math.abs(column - drift) + random() * 1.8;
        if (score > bestScore) {
          bestScore = score;
          best = { column, row, span, bookedAt: now };
        }
      }

      if (best) {
        bookings.push(best);
        claim(best, 1);
      }
    }

    function draw(now: number) {
      if (!context) return;
      context.clearRect(0, 0, width, height);

      const cellWidth = (width - GAP * (COLUMNS - 1)) / COLUMNS;
      const cellHeight = (height - GAP * (rows - 1)) / rows;
      const radius = Math.min(3, cellWidth / 5, cellHeight / 2);

      // The empty week underneath.
      context.strokeStyle = line;
      context.lineWidth = 1;
      context.globalAlpha = 1;
      for (let column = 0; column < COLUMNS; column++) {
        for (let row = 0; row < rows; row++) {
          context.beginPath();
          context.roundRect(
            column * (cellWidth + GAP),
            row * (cellHeight + GAP),
            cellWidth,
            cellHeight,
            radius,
          );
          context.stroke();
        }
      }

      // Everything currently booked.
      for (const booking of bookings) {
        const alpha = alphaFor(now - booking.bookedAt);
        if (alpha <= 0) continue;
        const x = booking.column * (cellWidth + GAP);
        const y = booking.row * (cellHeight + GAP);
        const h = booking.span * cellHeight + (booking.span - 1) * GAP;

        context.beginPath();
        context.roundRect(x, y, cellWidth, h, radius);
        context.globalAlpha = alpha * 0.16;
        context.fillStyle = signal;
        context.fill();
        context.globalAlpha = alpha * 0.55;
        context.strokeStyle = signal;
        context.stroke();
      }
      context.globalAlpha = 1;
    }

    function tick(timestamp: number) {
      if (!running) return;
      if (!startedAt) startedAt = timestamp;
      const now = timestamp - startedAt;

      if (now - lastBooking > BOOK_EVERY) {
        lastBooking = now;
        book(now);
      }

      const expired = bookings.filter((b) => now - b.bookedAt > LIFE_TOTAL);
      if (expired.length > 0) {
        for (const booking of expired) claim(booking, 0);
        bookings = bookings.filter((b) => now - b.bookedAt <= LIFE_TOTAL);
      }

      draw(now);
      frame = requestAnimationFrame(tick);
    }

    function start() {
      if (running || reduced) return;
      running = true;
      frame = requestAnimationFrame(tick);
    }

    function stop() {
      running = false;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    }

    function drawStill() {
      // A settled week for anyone who does not want movement.
      bookings = [];
      taken.fill(0);
      for (let i = 0; i < rows * 2; i++) book(0);
      draw(LIFE.fadeIn);
    }

    resize();
    if (reduced) drawStill();

    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (reduced) drawStill();
    });
    resizeObserver.observe(canvas);

    const visibility = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) start();
        else stop();
      },
      { threshold: 0 },
    );
    visibility.observe(canvas);

    const onVisibilityChange = () => {
      if (document.hidden) stop();
      else if (canvas.getBoundingClientRect().bottom > 0) start();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      stop();
      resizeObserver.disconnect();
      visibility.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className={className} />;
}
