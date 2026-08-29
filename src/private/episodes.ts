/**
 * Analysis for the episode log.
 *
 * Pure functions over already-parsed rows, ported from the previous Quasar
 * implementation with the maths kept identical: same ordinal encodings, same
 * Spearman correlation, same logistic occurrence model and the same 14 day
 * forecast. No personal data lives in this file.
 */

export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const FIELDS = [
  { key: "startDate", label: "Start date", required: true },
  { key: "startTime", label: "Start time", required: false },
  { key: "endDate", label: "End date", required: false },
  { key: "endTime", label: "End time", required: false },
  { key: "severity", label: "Severity", required: false },
  { key: "stress", label: "Stress", required: false },
  { key: "sleep", label: "Sleep quality", required: false },
  { key: "hydration", label: "Hydration", required: false },
  { key: "activity", label: "Activity", required: false },
  { key: "temperature", label: "Temperature", required: false },
  { key: "onPeriod", label: "On period", required: false },
  { key: "meds", label: "Medications", required: false },
  { key: "notes", label: "Notes and diet", required: false },
] as const;

export type FieldKey = (typeof FIELDS)[number]["key"];
export type Mapping = Partial<Record<FieldKey, string>>;
export type Row = Record<string, unknown>;

export type Episode = {
  start: Date;
  end: Date | null;
  durationMin: number | null;
  startHour: number;
  weekday: number;
  severity: number | null;
  stress: number | null;
  sleep: number | null;
  hydration: number | null;
  activity: string | null;
  temperature: string | null;
  onPeriod: boolean | null;
  meds: string;
  notes: string;
};

/* ------------------------------------------------------------------ parsing */

const EXCEL_EPOCH = Date.UTC(1899, 11, 30);

function toDate(value: unknown): Date | null {
  if (value == null || value === "") return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "number") {
    return new Date(EXCEL_EPOCH + value * 86_400_000);
  }
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toTime(value: unknown): string | null {
  if (value == null || value === "") return null;
  if (value instanceof Date) {
    return `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`;
  }
  if (typeof value === "number") {
    const total = Math.round(value * 24 * 60);
    const h = Math.floor(total / 60) % 24;
    const m = total % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }
  const text = String(value).trim();
  const match = text.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
  if (!match) return text;
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = (match[3] ?? "").toUpperCase();
  if (meridiem === "PM" && hour < 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function toNumber(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = Number(String(value).replace(/[^0-9.-]/g, ""));
  return Number.isNaN(n) ? null : n;
}

function toYesNo(value: unknown): boolean | null {
  if (value == null) return null;
  const s = String(value).toLowerCase().trim();
  if (["y", "yes", "true", "1"].includes(s)) return true;
  if (["n", "no", "false", "0"].includes(s)) return false;
  return null;
}

const cat = (value: unknown) => String(value ?? "").toLowerCase().trim();

export function ordStress(s: string): number | null {
  if (!s) return null;
  if (/^(3|high|severe)/.test(s)) return 3;
  if (/^(2|med|moderate)/.test(s)) return 2;
  if (/^(1|low|mild)/.test(s)) return 1;
  if (/^(0|none)/.test(s)) return 0;
  return null;
}

export function ordSleep(s: string): number | null {
  if (!s) return null;
  if (/^(good|3)/.test(s)) return 3;
  if (/^(ok|fair|2)/.test(s)) return 2;
  if (/^(poor|1)/.test(s)) return 1;
  if (/^(0|none)/.test(s)) return 0;
  return null;
}

export function ordHydration(s: string): number | null {
  if (!s) return null;
  if (/^(high|well|3)/.test(s)) return 3;
  if (/^(ok|2|moderate)/.test(s)) return 2;
  if (/^(low|1|poor)/.test(s)) return 1;
  if (/^(0|none)/.test(s)) return 0;
  return null;
}

export function catActivity(s: string): string | null {
  if (!s) return null;
  if (/^(hard|heavy|intense)/.test(s)) return "hard";
  if (/^(mod|moderate)/.test(s)) return "moderate";
  if (/^(light|walk|stretch)/.test(s)) return "light";
  if (/^(rest|none)/.test(s)) return "rest";
  return s;
}

export function catTemperature(s: string): string | null {
  if (!s) return null;
  if (/^cold/.test(s)) return "cold";
  if (/^warm/.test(s)) return "warm";
  if (/^hot/.test(s)) return "hot";
  if (/^(mixed|var)/.test(s)) return "mixed";
  return s;
}

function combine(date: Date, time: string): Date {
  const [h, m] = time.split(":");
  const out = new Date(date);
  out.setHours(Number(h) || 0, Number(m) || 0, 0, 0);
  return out;
}

/** Guess which spreadsheet column feeds which field, from the header text. */
export function autodetectMapping(headers: string[]): Mapping {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");
  const indexed = headers.map((h) => ({ header: h, n: norm(h) }));
  const pick = (...candidates: string[]) =>
    indexed.find((x) => candidates.some((c) => x.n.includes(c)))?.header;

  return {
    startDate: pick("startdate", "onsetdate", "date"),
    startTime: pick("starttime", "onsettime", "time"),
    endDate: pick("enddate"),
    endTime: pick("endtime"),
    severity: pick("severity", "pain", "nrs"),
    stress: pick("stress"),
    sleep: pick("sleepquality", "sleep"),
    hydration: pick("hydration"),
    activity: pick("activity", "exercise"),
    temperature: pick("temperature", "temp"),
    onPeriod: pick("onperiod", "period"),
    meds: pick("medication", "meds", "med"),
    notes: pick("notes", "diet", "comment"),
  };
}

export type ParseResult = { episodes: Episode[]; skipped: number };

export function parseRows(rows: Row[], mapping: Mapping): ParseResult {
  const get = (row: Row, key: FieldKey) => {
    const column = mapping[key];
    return column ? row[column] : null;
  };

  const episodes: Episode[] = [];
  let skipped = 0;

  for (const row of rows) {
    const startDate = toDate(get(row, "startDate"));
    if (!startDate) {
      skipped++;
      continue;
    }

    const startTime = toTime(get(row, "startTime")) ?? "00:00";
    const start = combine(startDate, startTime);

    const endDate = toDate(get(row, "endDate"));
    const endTime = toTime(get(row, "endTime"));
    let end: Date | null = null;
    if (endDate || endTime) {
      end = combine(endDate ?? startDate, endTime ?? startTime);
      // An episode that ends "before" it starts ran past midnight.
      if (end < start) end = new Date(end.getTime() + 86_400_000);
    }

    episodes.push({
      start,
      end,
      durationMin: end ? Math.round((end.getTime() - start.getTime()) / 60_000) : null,
      startHour: start.getHours(),
      weekday: start.getDay(),
      severity: toNumber(get(row, "severity")),
      stress: ordStress(cat(get(row, "stress"))),
      sleep: ordSleep(cat(get(row, "sleep"))),
      hydration: ordHydration(cat(get(row, "hydration"))),
      activity: catActivity(cat(get(row, "activity"))),
      temperature: catTemperature(cat(get(row, "temperature"))),
      onPeriod: toYesNo(get(row, "onPeriod")),
      meds: String(get(row, "meds") ?? "").toLowerCase(),
      notes: String(get(row, "notes") ?? ""),
    });
  }

  episodes.sort((a, b) => a.start.getTime() - b.start.getTime());
  return { episodes, skipped };
}

/* ----------------------------------------------------------------- filtering */

export type Filters = {
  dateFrom: string;
  dateTo: string;
  hourFrom: number;
  hourTo: number;
  weekdays: number[];
  temperature: string | null;
  onPeriodOnly: boolean;
  hasSeverityOnly: boolean;
};

export const DEFAULT_FILTERS: Filters = {
  dateFrom: "",
  dateTo: "",
  hourFrom: 0,
  hourTo: 23,
  weekdays: [],
  temperature: null,
  onPeriodOnly: false,
  hasSeverityOnly: false,
};

export function applyFilters(episodes: Episode[], f: Filters): Episode[] {
  return episodes.filter((e) => {
    if (f.dateFrom && e.start < new Date(f.dateFrom)) return false;
    if (f.dateTo && e.start > new Date(`${f.dateTo}T23:59:59`)) return false;
    if (e.startHour < f.hourFrom || e.startHour > f.hourTo) return false;
    if (f.weekdays.length > 0 && !f.weekdays.includes(e.weekday)) return false;
    if (f.temperature && e.temperature !== f.temperature) return false;
    if (f.onPeriodOnly && e.onPeriod !== true) return false;
    if (f.hasSeverityOnly && e.severity == null) return false;
    return true;
  });
}

/* --------------------------------------------------------------------- stats */

export function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length === 0) return 0;
  return sorted.length % 2 !== 0
    ? sorted[mid]!
    : ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2;
}

function ranks(values: number[]): number[] {
  const pairs = values.map((v, i) => ({ v, i }));
  pairs.sort((a, b) => a.v - b.v);
  const out = new Array<number>(values.length);
  pairs.forEach((p, i) => {
    out[p.i] = i + 1;
  });
  return out;
}

export function spearman(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length < 3) return 0;
  const rx = ranks(x);
  const ry = ranks(y);
  const mean = (a: number[]) => a.reduce((p, c) => p + c, 0) / a.length;
  const mx = mean(rx);
  const my = mean(ry);
  let num = 0;
  let dx2 = 0;
  let dy2 = 0;
  for (let i = 0; i < x.length; i++) {
    const a = (rx[i] ?? 0) - mx;
    const b = (ry[i] ?? 0) - my;
    num += a * b;
    dx2 += a * a;
    dy2 += b * b;
  }
  const den = Math.sqrt(dx2 * dy2);
  return den === 0 ? 0 : num / den;
}

export type Kpis = {
  total: number;
  nightPercent: number;
  medianDuration: number | null;
  medianSeverity: number | null;
  clusteredWithin24h: number;
};

export function computeKpis(episodes: Episode[]): Kpis | null {
  if (episodes.length === 0) return null;
  const night = episodes.filter(
    (e) => e.startHour >= 20 || e.startHour < 6,
  ).length;
  const durations = episodes
    .map((e) => e.durationMin)
    .filter((d): d is number => d != null);
  const severities = episodes
    .map((e) => e.severity)
    .filter((s): s is number => s != null);

  let clustered = 0;
  for (let i = 1; i < episodes.length; i++) {
    const gap = episodes[i]!.start.getTime() - episodes[i - 1]!.start.getTime();
    if (gap <= 86_400_000) clustered++;
  }

  return {
    total: episodes.length,
    nightPercent: (night / episodes.length) * 100,
    medianDuration: durations.length ? Math.round(median(durations)) : null,
    medianSeverity: severities.length ? median(severities) : null,
    clusteredWithin24h: clustered,
  };
}

export function hourHistogram(episodes: Episode[]): number[] {
  const bins = new Array<number>(24).fill(0);
  for (const e of episodes) bins[e.startHour] = (bins[e.startHour] ?? 0) + 1;
  return bins;
}

export function weekdayHistogram(episodes: Episode[]): number[] {
  const bins = new Array<number>(7).fill(0);
  for (const e of episodes) bins[e.weekday] = (bins[e.weekday] ?? 0) + 1;
  return bins;
}

export function dailyCounts(episodes: Episode[]): Array<{ t: number; v: number }> {
  const byDay = new Map<string, number>();
  for (const e of episodes) {
    const key = isoDay(e.start);
    byDay.set(key, (byDay.get(key) ?? 0) + 1);
  }
  return [...byDay.keys()]
    .sort()
    .map((day) => ({ t: new Date(`${day}T00:00:00`).getTime(), v: byDay.get(day)! }));
}

export type Correlation = { label: string; rho: number };

export function severityCorrelations(episodes: Episode[]): Correlation[] {
  const features: Array<{ key: keyof Episode; label: string }> = [
    { key: "stress", label: "Stress" },
    { key: "sleep", label: "Sleep" },
    { key: "hydration", label: "Hydration" },
    { key: "startHour", label: "Hour of onset" },
  ];
  const withSeverity = episodes.filter((e) => e.severity != null);
  const rows: Correlation[] = [];
  for (const f of features) {
    const pairs = withSeverity
      .map((e) => ({ x: e[f.key] as number | null, y: e.severity! }))
      .filter((p): p is { x: number; y: number } => p.x != null);
    if (pairs.length >= 5) {
      rows.push({
        label: f.label,
        rho: spearman(
          pairs.map((p) => p.x),
          pairs.map((p) => p.y),
        ),
      });
    }
  }
  return rows.sort((a, b) => Math.abs(b.rho) - Math.abs(a.rho));
}

export type FactorCell = { level: string; mean: number | null; n: number };
export type FactorRow = { label: string; cells: FactorCell[] };

export function severityByFactor(episodes: Episode[]): FactorRow[] {
  const factors: Array<{
    label: string;
    levels: string[];
    read: (e: Episode) => string | null;
  }> = [
    {
      label: "Temperature",
      levels: ["cold", "warm", "hot", "mixed"],
      read: (e) => e.temperature,
    },
    {
      label: "Activity",
      levels: ["rest", "light", "moderate", "hard"],
      read: (e) => e.activity,
    },
    {
      label: "On period",
      levels: ["true", "false"],
      read: (e) => (e.onPeriod == null ? null : String(e.onPeriod)),
    },
  ];

  return factors.map((factor) => ({
    label: factor.label,
    cells: factor.levels.map((level) => {
      const subset = episodes.filter(
        (e) => e.severity != null && factor.read(e) === level,
      );
      const mean =
        subset.length > 0
          ? subset.reduce((a, b) => a + (b.severity ?? 0), 0) / subset.length
          : null;
      return { level, mean, n: subset.length };
    }),
  }));
}

export type KeywordHit = { keyword: string; count: number; meanSeverity: number | null };

export function keywordHits(
  episodes: Episode[],
  keywords: string[],
): KeywordHit[] {
  return keywords
    .map((keyword) => {
      const escaped = keyword.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
      const re = new RegExp(`(^|\\b)${escaped}(\\b|$)`, "i");
      const subset = episodes.filter(
        (e) => re.test(e.notes) || re.test(e.meds),
      );
      const withSeverity = subset.filter((e) => e.severity != null);
      return {
        keyword,
        count: subset.length,
        meanSeverity: withSeverity.length
          ? withSeverity.reduce((a, b) => a + (b.severity ?? 0), 0) /
            withSeverity.length
          : null,
      };
    })
    .sort((a, b) => b.count - a.count);
}

/* ---------------------------------------------------------- occurrence model */

function isoDay(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export type ModelWeight = { name: string; weight: number };
export type Forecast = { t: number; risk: number };
export type OccurrenceModel = {
  weights: ModelWeight[];
  forecast: Forecast[];
  daysObserved: number;
};

const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

/**
 * Logistic regression on day-level "did an episode happen" outcomes, using day
 * of week (as sine and cosine), days since the last episode, and a rolling
 * seven day count. Fitted with plain gradient descent, then rolled forward
 * fourteen days. Ported unchanged from the original.
 */
export function fitOccurrenceModel(episodes: Episode[]): OccurrenceModel | null {
  if (episodes.length === 0) return null;

  const first = episodes[0]!;
  const last = episodes[episodes.length - 1]!;
  const minDate = new Date(first.start.toDateString());
  const maxDate = new Date(last.start.toDateString());

  const days: Date[] = [];
  for (
    let d = new Date(minDate);
    d <= maxDate;
    d = new Date(d.getTime() + 86_400_000)
  ) {
    days.push(new Date(d));
    if (days.length > 5000) break;
  }
  if (days.length < 14) return null;

  const episodeDays = new Set(episodes.map((e) => isoDay(e.start)));
  const episodeIndices = new Set<number>();
  for (const e of episodes) {
    const idx = Math.round(
      (new Date(e.start.toDateString()).getTime() - minDate.getTime()) /
        86_400_000,
    );
    if (idx >= 0) episodeIndices.add(idx);
  }

  const y: number[] = [];
  const X: number[][] = [];
  let daysSinceLast = 30;

  for (let i = 0; i < days.length; i++) {
    const day = days[i]!;
    const happened = episodeDays.has(isoDay(day)) ? 1 : 0;
    y.push(happened);

    const dow = day.getDay();
    let rolling = 0;
    for (let j = Math.max(0, i - 7); j < i; j++) {
      if (episodeIndices.has(j)) rolling++;
    }

    X.push([
      1,
      Math.sin((2 * Math.PI * dow) / 7),
      Math.cos((2 * Math.PI * dow) / 7),
      daysSinceLast,
      rolling,
    ]);

    daysSinceLast = happened ? 0 : Math.min(daysSinceLast + 1, 60);
  }

  // Standardise everything but the bias column.
  const means = [0, 0, 0, 0, 0];
  const stds = [1, 1, 1, 1, 1];
  for (let j = 1; j < 5; j++) {
    const col = X.map((r) => r[j]!);
    const mu = col.reduce((a, b) => a + b, 0) / col.length;
    const variance =
      col.reduce((a, b) => a + (b - mu) * (b - mu), 0) / (col.length - 1 || 1);
    const sd = Math.sqrt(variance) || 1;
    for (const row of X) row[j] = ((row[j] ?? 0) - mu) / sd;
    means[j] = mu;
    stds[j] = sd;
  }

  const w = [0, 0, 0, 0, 0];
  const learningRate = 0.1;
  const iterations = 400;
  const regularisation = 0.01;

  for (let it = 0; it < iterations; it++) {
    const grad = [0, 0, 0, 0, 0];
    for (let i = 0; i < X.length; i++) {
      const row = X[i]!;
      let z = 0;
      for (let j = 0; j < 5; j++) z += (w[j] ?? 0) * (row[j] ?? 0);
      const err = sigmoid(z) - (y[i] ?? 0);
      for (let j = 0; j < 5; j++) grad[j] = (grad[j] ?? 0) + err * (row[j] ?? 0);
    }
    for (let j = 0; j < 5; j++) {
      w[j] = (w[j] ?? 0) - learningRate * ((grad[j] ?? 0) / X.length + regularisation * (w[j] ?? 0));
    }
  }

  const lastDay = days[days.length - 1]!;
  let daysSince = 60;
  for (let k = 0; k < 60; k++) {
    if (episodeDays.has(isoDay(new Date(lastDay.getTime() - k * 86_400_000)))) {
      daysSince = k;
      break;
    }
  }

  let rollingHistory: number[] = [];
  for (let k = 6; k >= 0; k--) {
    rollingHistory.push(
      episodeDays.has(isoDay(new Date(lastDay.getTime() - k * 86_400_000))) ? 1 : 0,
    );
  }

  const forecast: Forecast[] = [];
  for (let h = 1; h <= 14; h++) {
    const day = new Date(lastDay.getTime() + h * 86_400_000);
    const dow = day.getDay();
    const raw = [
      1,
      Math.sin((2 * Math.PI * dow) / 7),
      Math.cos((2 * Math.PI * dow) / 7),
      daysSince,
      rollingHistory.reduce((a, b) => a + b, 0),
    ];
    let z = 0;
    for (let j = 0; j < 5; j++) {
      const value = j === 0 ? 1 : ((raw[j] ?? 0) - (means[j] ?? 0)) / (stds[j] ?? 1);
      z += (w[j] ?? 0) * value;
    }
    forecast.push({ t: day.getTime(), risk: sigmoid(z) * 100 });

    daysSince = Math.min(daysSince + 1, 60);
    rollingHistory = rollingHistory.slice(1).concat([0]);
  }

  return {
    weights: [
      { name: "Day of week (sin)", weight: w[1] ?? 0 },
      { name: "Day of week (cos)", weight: w[2] ?? 0 },
      { name: "Days since last", weight: w[3] ?? 0 },
      { name: "Rolling 7 day count", weight: w[4] ?? 0 },
    ],
    forecast,
    daysObserved: days.length,
  };
}

export function dataQuality(episodes: Episode[], skipped: number): string[] {
  const issues: string[] = [];
  if (skipped > 0) {
    issues.push(`${skipped} row${skipped === 1 ? "" : "s"} skipped, no start date`);
  }
  const missingSeverity = episodes.filter((e) => e.severity == null).length;
  const missingEnd = episodes.filter((e) => e.end == null).length;
  if (missingSeverity) {
    issues.push(`${missingSeverity} without a severity score`);
  }
  if (missingEnd) {
    issues.push(`${missingEnd} without an end time, so no duration`);
  }
  return issues;
}
