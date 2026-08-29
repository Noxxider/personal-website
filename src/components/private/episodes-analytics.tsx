"use client";

import * as React from "react";
import { LineChart } from "@/components/line-chart";
import { BarChart } from "@/components/private/bar-chart";
import { Stat, StatGrid } from "@/components/private/stat";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  applyFilters,
  autodetectMapping,
  computeKpis,
  dailyCounts,
  dataQuality,
  DEFAULT_FILTERS,
  FIELDS,
  fitOccurrenceModel,
  hourHistogram,
  keywordHits,
  parseRows,
  severityByFactor,
  severityCorrelations,
  weekdayHistogram,
  WEEKDAYS,
  type Filters,
  type Mapping,
  type Row,
} from "@/private/episodes";

const DIET_KEYWORDS = [
  "caffeine",
  "coffee",
  "alcohol",
  "wine",
  "beer",
  "spicy",
  "chili",
  "fatty",
  "sugar",
  "dessert",
];

const TEMPERATURES = ["cold", "warm", "hot", "mixed"];

type Loaded = { headers: string[]; rows: Row[]; fileName: string };

export function EpisodesAnalytics({ questions }: { questions: string[] }) {
  const [loaded, setLoaded] = React.useState<Loaded | null>(null);
  const [mapping, setMapping] = React.useState<Mapping>({});
  const [filters, setFilters] = React.useState<Filters>(DEFAULT_FILTERS);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      // Loaded on demand so the parser never ships with the initial page.
      const { default: readXlsxFile } = await import("read-excel-file/browser");
      const sheets = await readXlsxFile(file);
      if (sheets.length === 0) {
        setError("That workbook has no sheets.");
        setBusy(false);
        return;
      }

      // Prefer the sheet the log actually lives on, as the original did.
      const chosen =
        sheets.find(
          (s) =>
            s.sheet.toLowerCase().includes("date") &&
            s.sheet.toLowerCase().includes("interval"),
        ) ?? sheets[0]!;

      const grid = chosen.data as unknown[][];
      if (grid.length < 2) {
        setError(`Sheet "${chosen.sheet}" has no data rows.`);
        setBusy(false);
        return;
      }

      const headers = (grid[0] ?? []).map((h, i) =>
        String(h ?? `Column ${i + 1}`).trim(),
      );
      const rows: Row[] = grid.slice(1).map((line) => {
        const row: Row = {};
        headers.forEach((header, i) => {
          row[header] = line[i] ?? null;
        });
        return row;
      });

      setLoaded({ headers, rows, fileName: file.name });
      setMapping(autodetectMapping(headers));
    } catch {
      setError("Could not read that file. It needs to be a .xlsx workbook.");
    } finally {
      setBusy(false);
    }
  }

  const parsed = React.useMemo(
    () => (loaded ? parseRows(loaded.rows, mapping) : null),
    [loaded, mapping],
  );

  const episodes = React.useMemo(
    () => (parsed ? applyFilters(parsed.episodes, filters) : []),
    [parsed, filters],
  );

  const kpis = React.useMemo(() => computeKpis(episodes), [episodes]);
  const timeline = React.useMemo(() => dailyCounts(episodes), [episodes]);
  const hours = React.useMemo(() => hourHistogram(episodes), [episodes]);
  const weekdays = React.useMemo(() => weekdayHistogram(episodes), [episodes]);
  const correlations = React.useMemo(
    () => severityCorrelations(episodes),
    [episodes],
  );
  const factors = React.useMemo(() => severityByFactor(episodes), [episodes]);
  const keywords = React.useMemo(
    () => keywordHits(episodes, DIET_KEYWORDS),
    [episodes],
  );
  const model = React.useMemo(() => fitOccurrenceModel(episodes), [episodes]);
  const issues = React.useMemo(
    () => (parsed ? dataQuality(episodes, parsed.skipped) : []),
    [parsed, episodes],
  );

  function reset() {
    setLoaded(null);
    setMapping({});
    setFilters(DEFAULT_FILTERS);
    setError(null);
  }

  return (
    <div>
      <div className="print:hidden">
        <h1 className="font-display text-title">Episodes</h1>
        <p className="mt-2 max-w-[64ch] text-[0.9375rem] leading-relaxed text-ink-muted">
          Load the workbook and it summarises timing, severity and possible
          associations. The file is read in your browser and never uploaded
          anywhere.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-line pt-6">
          <label className={cn(buttonVariants({ variant: "outline", size: "sm" }), "cursor-pointer")}>
            <input
              type="file"
              accept=".xlsx"
              className="sr-only"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
            {busy ? "Reading" : "Choose a workbook"}
          </label>
          {loaded && (
            <>
              <span className="font-mono text-[0.8125rem] text-ink-faint">
                {loaded.fileName}
              </span>
              <button
                type="button"
                onClick={reset}
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Print
              </button>
            </>
          )}
        </div>

        {error && (
          <p role="alert" className="mt-4 text-[0.875rem] text-signal">
            {error}
          </p>
        )}
      </div>

      {!loaded ? (
        <div className="mt-10 rounded-xl border border-dashed border-line-strong p-8 print:hidden">
          <p className="font-display text-2xl">No workbook loaded</p>
          <p className="mt-2 max-w-[52ch] text-[0.9375rem] leading-relaxed text-ink-muted">
            It looks for a sheet named something like &ldquo;Date Interval&rdquo;
            and falls back to the first one. Column names are matched
            automatically, and you can correct them below once it is loaded.
          </p>
        </div>
      ) : (
        <>
          {/* --------------------------------------------------- Column mapping */}
          <details className="mt-10 border-t border-line pt-5 print:hidden">
            <summary className="eyebrow cursor-pointer select-none">
              Column mapping
            </summary>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FIELDS.map((field) => (
                <div key={field.key}>
                  <Label htmlFor={`map-${field.key}`}>
                    {field.label}
                    {field.required && <span className="text-signal"> *</span>}
                  </Label>
                  <select
                    id={`map-${field.key}`}
                    value={mapping[field.key] ?? ""}
                    onChange={(e) =>
                      setMapping({
                        ...mapping,
                        [field.key]: e.target.value || undefined,
                      })
                    }
                    className="mt-2 h-11 w-full rounded-lg border border-line-strong bg-paper-raised px-3 text-[0.9375rem] text-ink"
                  >
                    <option value="">Not mapped</option>
                    {loaded.headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </details>

          {/* --------------------------------------------------------- Filters */}
          <details className="mt-6 border-t border-line pt-5 print:hidden">
            <summary className="eyebrow cursor-pointer select-none">
              Filters
            </summary>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label htmlFor="from">From</Label>
                <Input
                  id="from"
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) =>
                    setFilters({ ...filters, dateFrom: e.target.value })
                  }
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="to">To</Label>
                <Input
                  id="to"
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) =>
                    setFilters({ ...filters, dateTo: e.target.value })
                  }
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="hourFrom">
                  Hours {filters.hourFrom} to {filters.hourTo}
                </Label>
                <div className="mt-3 flex items-center gap-3">
                  <input
                    id="hourFrom"
                    type="range"
                    min={0}
                    max={23}
                    value={filters.hourFrom}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        hourFrom: Math.min(Number(e.target.value), filters.hourTo),
                      })
                    }
                    className="w-full accent-[var(--color-signal)]"
                  />
                  <input
                    aria-label="Latest hour"
                    type="range"
                    min={0}
                    max={23}
                    value={filters.hourTo}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        hourTo: Math.max(Number(e.target.value), filters.hourFrom),
                      })
                    }
                    className="w-full accent-[var(--color-signal)]"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="temp">Temperature</Label>
                <select
                  id="temp"
                  value={filters.temperature ?? ""}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      temperature: e.target.value || null,
                    })
                  }
                  className="mt-2 h-11 w-full rounded-lg border border-line-strong bg-paper-raised px-3 text-[0.9375rem] text-ink"
                >
                  <option value="">Any</option>
                  {TEMPERATURES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <fieldset className="mt-5">
              <legend className="eyebrow">Weekdays</legend>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {WEEKDAYS.map((label, index) => {
                  const on = filters.weekdays.includes(index);
                  return (
                    <button
                      key={label}
                      type="button"
                      aria-pressed={on}
                      onClick={() =>
                        setFilters({
                          ...filters,
                          weekdays: on
                            ? filters.weekdays.filter((d) => d !== index)
                            : [...filters.weekdays, index],
                        })
                      }
                      className={cn(
                        "rounded-full px-3 py-1.5 font-mono text-[0.6875rem] transition-colors",
                        on
                          ? "bg-ink text-paper"
                          : "border border-line-strong text-ink-muted hover:border-ink",
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="mt-5 flex flex-wrap gap-5">
              <Toggle
                checked={filters.onPeriodOnly}
                onChange={(v) => setFilters({ ...filters, onPeriodOnly: v })}
                label="On period only"
              />
              <Toggle
                checked={filters.hasSeverityOnly}
                onChange={(v) => setFilters({ ...filters, hasSeverityOnly: v })}
                label="With a severity score only"
              />
              <button
                type="button"
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="text-[0.8125rem] text-ink-muted underline decoration-line-strong underline-offset-4 hover:decoration-signal"
              >
                Clear filters
              </button>
            </div>
          </details>

          {/* ------------------------------------------------------------ KPIs */}
          {kpis === null ? (
            <p className="mt-10 text-[0.9375rem] text-ink-muted">
              No episodes match these filters.
            </p>
          ) : (
            <>
              <StatGrid>
                <Stat label="Episodes" value={kpis.total} />
                <Stat
                  label="At night"
                  value={`${kpis.nightPercent.toFixed(0)}%`}
                  hint="20:00 to 06:00"
                />
                <Stat
                  label="Median duration"
                  value={kpis.medianDuration ?? "not recorded"}
                  hint={kpis.medianDuration != null ? "Minutes" : undefined}
                />
                <Stat
                  label="Median severity"
                  value={kpis.medianSeverity?.toFixed(1) ?? "not recorded"}
                />
                <Stat
                  label="Within 24h of another"
                  value={kpis.clusteredWithin24h}
                  hint="Clustering"
                />
                <Stat
                  label="Days observed"
                  value={model?.daysObserved ?? "not enough"}
                />
              </StatGrid>

              <Panel title="Episodes per day">
                {timeline.length >= 2 ? (
                  <LineChart
                    points={timeline}
                    unit="episodes"
                    label="Episodes per day"
                  />
                ) : (
                  <p className="text-[0.9375rem] text-ink-faint">
                    Needs at least two days with episodes.
                  </p>
                )}
              </Panel>

              <div className="mt-10 grid gap-10 lg:grid-cols-2">
                <Panel title="By hour of onset" flush>
                  <BarChart
                    bars={hours.map((value, hour) => ({
                      label: `${String(hour).padStart(2, "0")}:00`,
                      value,
                    }))}
                  />
                </Panel>
                <Panel title="By weekday" flush>
                  <BarChart
                    bars={weekdays.map((value, i) => ({
                      label: WEEKDAYS[i]!,
                      value,
                    }))}
                  />
                </Panel>
                <Panel title="Severity correlation" flush>
                  <BarChart
                    bars={correlations.map((c) => ({
                      label: c.label,
                      value: c.rho,
                      caption: c.rho.toFixed(2),
                    }))}
                    signed
                    emptyLabel="Needs at least five episodes with a severity score."
                  />
                  <p className="mt-4 text-[0.75rem] leading-relaxed text-ink-faint">
                    Spearman rank correlation against severity. This is
                    association, not cause, and small samples move it a lot.
                  </p>
                </Panel>
                <Panel title="Diet and medication mentions" flush>
                  <BarChart
                    bars={keywords.map((k) => ({
                      label: k.keyword,
                      value: k.count,
                      caption:
                        k.meanSeverity == null
                          ? String(k.count)
                          : `${k.count} · sev ${k.meanSeverity.toFixed(1)}`,
                    }))}
                  />
                </Panel>
              </div>

              <Panel title="Mean severity by factor">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-md border-collapse text-left">
                    <tbody>
                      {factors.map((row) => (
                        <tr key={row.label} className="border-t border-line">
                          <th
                            scope="row"
                            className="py-3 pr-6 text-[0.8125rem] font-medium text-ink-muted"
                          >
                            {row.label}
                          </th>
                          {row.cells.map((cell) => (
                            <td key={cell.level} className="py-3 pr-6">
                              <span className="eyebrow block">{cell.level}</span>
                              <span
                                className="tabular mt-1 block rounded px-2 py-1 font-mono text-[0.8125rem]"
                                style={
                                  cell.mean == null
                                    ? undefined
                                    : {
                                        backgroundColor: `color-mix(in oklab, var(--color-signal) ${Math.min(100, (cell.mean / 10) * 100)}%, var(--color-paper-sunken))`,
                                      }
                                }
                              >
                                {cell.mean == null
                                  ? "no data"
                                  : `${cell.mean.toFixed(2)} (n=${cell.n})`}
                              </span>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>

              {model && (
                <div className="mt-10 grid gap-10 lg:grid-cols-2">
                  <Panel title="Next 14 days, modelled risk" flush>
                    <LineChart
                      points={model.forecast.map((f) => ({ t: f.t, v: f.risk }))}
                      unit="percent"
                      label="Modelled daily risk over the next fourteen days"
                    />
                  </Panel>
                  <Panel title="What the model leans on" flush>
                    <BarChart
                      bars={model.weights.map((w) => ({
                        label: w.name,
                        value: w.weight,
                        caption: w.weight.toFixed(2),
                      }))}
                      signed
                    />
                    <p className="mt-4 text-[0.75rem] leading-relaxed text-ink-faint">
                      Logistic regression on day of week, days since the last
                      episode and a rolling seven day count. It is a pattern in
                      past data, not a prediction to rely on.
                    </p>
                  </Panel>
                </div>
              )}

              {issues.length > 0 && (
                <Panel title="Data quality">
                  <ul className="space-y-1.5">
                    {issues.map((issue) => (
                      <li key={issue} className="text-[0.9375rem] text-ink-muted">
                        {issue}
                      </li>
                    ))}
                  </ul>
                </Panel>
              )}

              {questions.length > 0 && (
                <Panel title="Questions to raise">
                  <ul className="max-w-[64ch] space-y-2.5">
                    {questions.map((q) => (
                      <li
                        key={q}
                        className="text-[0.9375rem] leading-relaxed text-ink-muted"
                      >
                        {q}
                      </li>
                    ))}
                  </ul>
                </Panel>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

function Panel({
  title,
  children,
  flush,
}: {
  title: string;
  children: React.ReactNode;
  flush?: boolean;
}) {
  return (
    <section className={cn(flush ? "" : "mt-10", "border-t border-line pt-5")}>
      <h2 className="eyebrow">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-[0.8125rem] text-ink-muted">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 accent-[var(--color-signal)]"
      />
      {label}
    </label>
  );
}
