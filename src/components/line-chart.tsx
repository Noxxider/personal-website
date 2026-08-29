"use client";

import * as React from "react";

export type Point = { t: number; v: number };

const PAD = { top: 18, right: 18, bottom: 34, left: 46 };
const FALLBACK_WIDTH = 720;

function ticksFor(min: number, max: number, step: number): number[] {
  const start = Math.ceil(min / step) * step;
  const out: number[] = [];
  for (let v = start; v <= max + step * 1e-6; v += step) {
    out.push(Number(v.toFixed(6)));
  }
  return out;
}

function niceTicks(min: number, max: number, target = 4): number[] {
  if (!(max > min)) return [min];
  const mag = 10 ** Math.floor(Math.log10((max - min) / target));
  let best: number[] = [];
  let bestScore = Infinity;
  for (const scale of [0.1, 1, 10]) {
    for (const m of [1, 2, 2.5, 5]) {
      const candidate = ticksFor(min, max, m * mag * scale);
      if (candidate.length < 2 || candidate.length > 8) continue;
      const score = Math.abs(candidate.length - target);
      if (score < bestScore) {
        bestScore = score;
        best = candidate;
      }
    }
  }
  return best.length > 0 ? best : ticksFor(min, max, (max - min) / target);
}

/** Catmull-Rom through the points, converted to cubic beziers. */
function smoothPath(pts: Array<[number, number]>): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0]![0]} ${pts[0]![1]}`;
  let d = `M ${pts[0]![0]} ${pts[0]![1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)]!;
    const p1 = pts[i]!;
    const p2 = pts[i + 1]!;
    const p3 = pts[Math.min(pts.length - 1, i + 2)]!;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return d;
}

const dateFmt = new Intl.DateTimeFormat("en-CA", {
  month: "short",
  day: "numeric",
});

/**
 * Small, dependency free line chart.
 *
 * The SVG is drawn at the container's real pixel size rather than at a fixed
 * viewBox that gets scaled by CSS, so the axis labels stay the same physical
 * size on a phone as they are on a desktop.
 */
export function LineChart({
  points,
  unit,
  label,
}: {
  points: Point[];
  unit: string;
  label: string;
}) {
  const hostRef = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState(FALLBACK_WIDTH);

  React.useEffect(() => {
    const node = hostRef.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      const next = Math.round(entry?.contentRect.width ?? 0);
      if (next > 0) setWidth(next);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const W = Math.max(280, width);
  const H = Math.round(Math.min(320, Math.max(210, W * 0.42)));

  const values = points.map((p) => p.v);
  const vMin = Math.min(...values);
  const vMax = Math.max(...values);
  const span = vMax - vMin || 1;
  const yLo = vMin - span * 0.18;
  const yHi = vMax + span * 0.18;

  const tMin = points[0]!.t;
  const tMax = points[points.length - 1]!.t;
  const tSpan = tMax - tMin || 1;

  const x = (t: number) =>
    PAD.left + ((t - tMin) / tSpan) * (W - PAD.left - PAD.right);
  const y = (v: number) =>
    PAD.top + (1 - (v - yLo) / (yHi - yLo)) * (H - PAD.top - PAD.bottom);

  const coords = points.map((p) => [x(p.t), y(p.v)] as [number, number]);
  const line = smoothPath(coords);
  const area = `${line} L ${coords[coords.length - 1]![0].toFixed(2)} ${H - PAD.bottom} L ${coords[0]![0].toFixed(2)} ${H - PAD.bottom} Z`;

  const yTicks = niceTicks(yLo, yHi, W < 420 ? 3 : 4);
  // A narrow chart only has room for the endpoints.
  const xTickIdx = (
    W < 420 ? [0, points.length - 1] : [0, Math.floor((points.length - 1) / 2), points.length - 1]
  ).filter((v, i, a) => a.indexOf(v) === i);

  const last = points[points.length - 1]!;

  return (
    <div ref={hostRef} className="w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        className="block h-auto w-full"
        role="img"
        aria-label={`${label}. ${points.length} readings from ${dateFmt.format(tMin)} to ${dateFmt.format(tMax)}, ranging from ${vMin} to ${vMax} ${unit}.`}
      >
        <defs>
          <linearGradient id="lc-fill" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--color-signal)"
              stopOpacity="0.14"
            />
            <stop
              offset="100%"
              stopColor="var(--color-signal)"
              stopOpacity="0"
            />
          </linearGradient>
        </defs>

        {yTicks.map((t) => (
          <g key={t}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y(t)}
              y2={y(t)}
              stroke="var(--color-line)"
              strokeWidth="1"
            />
            <text
              x={PAD.left - 10}
              y={y(t)}
              textAnchor="end"
              dominantBaseline="middle"
              fill="var(--color-ink-faint)"
              fontSize="11"
              fontFamily="var(--font-mono)"
            >
              {t}
            </text>
          </g>
        ))}

        <path d={area} fill="url(#lc-fill)" />
        <path
          d={line}
          fill="none"
          stroke="var(--color-signal)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <circle
          cx={x(last.t)}
          cy={y(last.v)}
          r="4"
          fill="var(--color-signal)"
          stroke="var(--color-paper-raised)"
          strokeWidth="2"
        />

        {xTickIdx.map((i) => (
          <text
            key={i}
            x={Math.min(
              Math.max(x(points[i]!.t), PAD.left),
              W - PAD.right,
            )}
            y={H - 10}
            textAnchor={
              i === 0 ? "start" : i === points.length - 1 ? "end" : "middle"
            }
            fill="var(--color-ink-faint)"
            fontSize="11"
            fontFamily="var(--font-mono)"
          >
            {dateFmt.format(points[i]!.t)}
          </text>
        ))}
      </svg>
    </div>
  );
}
