"use client";

import * as React from "react";
import {
  DEFAULT_PARAMS,
  divergence,
  positions,
  stepRK4,
  type PendulumState,
} from "@/lib/sims/pendulum";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

/**
 * Two double pendulums on one canvas, released a hair apart. The teal one is
 * the reference; the amber one starts `offset` radians away on the second
 * arm. A readout shows how far apart they are, and a small history strip
 * shows when the split happened. Fixed step RK4, several substeps per frame.
 */

const DT = 0.002;
const TRAIL = 900;

type Run = {
  a: PendulumState;
  b: PendulumState;
  trailA: Array<[number, number]>;
  trailB: Array<[number, number]>;
  history: number[];
  time: number;
};

function start(angle: number, offset: number): Run {
  return {
    a: [angle, 0, angle, 0],
    b: [angle, 0, angle + offset, 0],
    trailA: [],
    trailB: [],
    history: [],
    time: 0,
  };
}

export function DoublePendulum() {
  const canvas = React.useRef<HTMLCanvasElement>(null);
  const run = React.useRef<Run>(start(2.1, 0.001));
  const readout = React.useRef<HTMLSpanElement>(null);
  const clockOut = React.useRef<HTMLSpanElement>(null);
  const [angle, setAngle] = React.useState(2.1);
  const [offset, setOffset] = React.useState(0.001);
  const [speed, setSpeed] = React.useState(1);
  const [running, setRunning] = React.useState(true);
  const state = React.useRef({ running, speed });

  React.useEffect(() => {
    state.current = { running, speed };
  }, [running, speed]);

  const reset = React.useCallback((a = angle, o = offset) => {
    run.current = start(a, o);
  }, [angle, offset]);

  React.useEffect(() => {
    const el = canvas.current;
    const context = el?.getContext("2d");
    if (!el || !context) return;
    let frame = 0;
    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = el.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      el.width = Math.round(width * dpr);
      el.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(el);

    const draw = () => {
      frame = requestAnimationFrame(draw);
      const r = run.current;
      const { running: on, speed: spd } = state.current;
      if (on) {
        const substeps = Math.round((1 / 60 / DT) * spd);
        for (let i = 0; i < substeps; i++) {
          r.a = stepRK4(r.a, DT);
          r.b = stepRK4(r.b, DT);
          r.time += DT;
        }
        const pa = positions(r.a);
        const pb = positions(r.b);
        r.trailA.push([pa.x2, pa.y2]);
        r.trailB.push([pb.x2, pb.y2]);
        if (r.trailA.length > TRAIL) r.trailA.shift();
        if (r.trailB.length > TRAIL) r.trailB.shift();
        r.history.push(divergence(r.a, r.b));
        if (r.history.length > 600) r.history.shift();
      }

      const scale = Math.min(width, height) / 4.6;
      const cx = width / 2;
      const cy = height * 0.42;
      context.clearRect(0, 0, width, height);

      const trail = (points: Array<[number, number]>, color: string) => {
        for (let i = 1; i < points.length; i++) {
          const [x0, y0] = points[i - 1]!;
          const [x1, y1] = points[i]!;
          context.strokeStyle = color;
          context.globalAlpha = (i / points.length) * 0.8;
          context.lineWidth = 1.4;
          context.beginPath();
          context.moveTo(cx + x0 * scale, cy + y0 * scale);
          context.lineTo(cx + x1 * scale, cy + y1 * scale);
          context.stroke();
        }
        context.globalAlpha = 1;
      };
      trail(r.trailA, "#5fd3e6");
      trail(r.trailB, "#f2a65a");

      const arm = (s: PendulumState, color: string) => {
        const p = positions(s, DEFAULT_PARAMS);
        context.strokeStyle = "#8b95a5";
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(cx, cy);
        context.lineTo(cx + p.x1 * scale, cy + p.y1 * scale);
        context.lineTo(cx + p.x2 * scale, cy + p.y2 * scale);
        context.stroke();
        context.fillStyle = color;
        for (const [x, y] of [[p.x1, p.y1], [p.x2, p.y2]] as const) {
          context.beginPath();
          context.arc(cx + x * scale, cy + y * scale, 7, 0, Math.PI * 2);
          context.fill();
        }
      };
      arm(r.a, "#5fd3e6");
      arm(r.b, "#f2a65a");
      context.fillStyle = "#e8ecf1";
      context.beginPath();
      context.arc(cx, cy, 4, 0, Math.PI * 2);
      context.fill();

      // Divergence strip along the bottom.
      const stripTop = height - 46;
      context.fillStyle = "#1e2530";
      context.fillRect(24, stripTop + 30, width - 48, 1);
      context.strokeStyle = "#5fd3e6";
      context.lineWidth = 1.2;
      context.beginPath();
      r.history.forEach((d, i) => {
        const x = 24 + (i / 600) * (width - 48);
        const y = stripTop + 30 - Math.min(1, d / Math.PI) * 30;
        if (i === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      });
      context.stroke();

      if (readout.current) readout.current.textContent = divergence(r.a, r.b).toFixed(4);
      if (clockOut.current) clockOut.current.textContent = `${r.time.toFixed(1)} s`;
    };
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-surface sm:aspect-[16/10]">
        <canvas ref={canvas} className="h-full w-full" aria-label="Two double pendulums swinging" />
        <div className="pointer-events-none absolute top-4 left-4 flex gap-4">
          <span className="label flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-signal" /> reference
          </span>
          <span className="label flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-accent" /> {offset} rad off
          </span>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <Label htmlFor="angle">Release angle: {angle.toFixed(2)} rad</Label>
          <input
            id="angle"
            type="range"
            min={0.3}
            max={3.1}
            step={0.05}
            value={angle}
            onChange={(e) => {
              const a = Number(e.target.value);
              setAngle(a);
              reset(a, offset);
            }}
            className="mt-2 w-full accent-[#5fd3e6]"
          />
        </div>

        <fieldset>
          <legend className="label">Starting difference</legend>
          <div className="mt-2 grid grid-cols-3 gap-1 rounded-lg border border-line p-1">
            {[0.1, 0.001, 0.00001].map((o) => (
              <button
                key={o}
                type="button"
                aria-pressed={offset === o}
                onClick={() => {
                  setOffset(o);
                  reset(angle, o);
                }}
                className={
                  offset === o
                    ? "rounded-md bg-ink px-2 py-2 font-mono text-xs text-ground"
                    : "rounded-md px-2 py-2 font-mono text-xs text-ink-muted hover:text-ink"
                }
              >
                {o}
              </button>
            ))}
          </div>
        </fieldset>

        <div>
          <Label htmlFor="speed">Speed: {speed.toFixed(1)}×</Label>
          <input
            id="speed"
            type="range"
            min={0.2}
            max={3}
            step={0.1}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="mt-2 w-full accent-[#5fd3e6]"
          />
        </div>

        <dl className="grid grid-cols-2 gap-3 border-t border-line pt-4 lg:grid-cols-1">
          <div>
            <dt className="label">Divergence, rad</dt>
            <dd className="mt-1 font-mono text-lg text-ink tabular">
              <span ref={readout}>0.0000</span>
            </dd>
          </div>
          <div>
            <dt className="label">Elapsed</dt>
            <dd className="mt-1 font-mono text-lg text-ink tabular">
              <span ref={clockOut}>0.0 s</span>
            </dd>
          </div>
        </dl>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setRunning((r) => !r)}>
            {running ? "Pause" : "Run"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => reset()}>
            Release again
          </Button>
        </div>
      </div>
    </div>
  );
}
