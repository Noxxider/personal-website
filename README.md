# ravinojuwono.com

Personal site for Ravino Juwono. Next.js App Router, TypeScript, Tailwind CSS v4,
exported as static HTML and published on Netlify.

```bash
npm install
npm run dev        # http://localhost:3000
npm run check      # typecheck + lint + build
npm run serve:out  # serve the production export on :4173
```

## Architecture

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16, App Router, `output: "export"` |
| Rendering | Every route prerendered to HTML at build time. No server runtime, no serverless functions, no API routes. |
| Styling | Tailwind v4 with design tokens declared in `@theme` inside `src/app/globals.css`. No config file. |
| Components | A few shadcn/ui primitives (`button`, `input`, `label`, `sheet`) sitting on Radix, with the rest composed by hand. |
| Icons | Seven inline SVGs in `src/components/icons.tsx`. No icon package. |
| Charts | Hand-drawn SVG in `src/components/line-chart.tsx`. No charting library. |
| Analytics | The existing GA4 property, loaded `afterInteractive`. Nothing else. |
| Deployment | Netlify, config in `netlify.toml`. Build `npm run build`, publish `out`. |

Runtime dependencies are `next`, `react`, `react-dom`, `@radix-ui/react-dialog`
(mobile navigation, for focus trapping and escape handling), and the
`clsx` / `tailwind-merge` / `class-variance-authority` trio that shadcn uses.

### Layout of the source

```
src/
  app/                 routes, one directory per page
  components/          layout shell, page primitives, the two tools
  components/ui/       shadcn primitives, restyled to the token set
  content/             all copy and structured data (site.ts, work.ts)
  lib/                 cn() helper and the page metadata builder
scripts/               post-build fixup, see below
legacy-quasar/         the previous Quasar site, kept for reference
```

Copy lives in `src/content`, not in the components. Editing the site means
editing two files.

### The post-build script

`scripts/flatten-segment-prefetch.mjs` works around a Next 16 export bug. The
router requests segment prefetch payloads at flat paths such as
`/work/__next.work.__PAGE__.txt`, but the exporter writes them as nested
directories (`out/work/__next.work/__PAGE__.txt`). Without the fix, every
prefetch 404s on a static host and navigation falls back to a full page load.
The script copies each payload to the flat name and is a no-op once Next emits
those files itself, so it is safe to leave in place.

## Design

Warm paper ground, near-black ink, one signal colour (a deep rust) used
sparingly for links on hover, live markers, focus rings and errors. Instrument
Serif for display type, Inter Tight for everything else, and the system
monospace stack for metadata labels. Both webfonts are self-hosted by
`next/font`, so the page makes no third-party font request.

There is one committed light theme and no toggle. Dark mode was removed from the
previous site deliberately and adding it back would mean maintaining a second
palette for no clear gain.

Motion is limited to a short fade-and-rise on scroll, and it never applies above
the fold: hero content renders at full opacity in the initial HTML so it is not
waiting on hydration. `prefers-reduced-motion` disables it, and a `<noscript>`
style keeps everything visible without JavaScript.

## Content decisions

**Kept and rewritten.** The name, the location, the email, LinkedIn, GitHub, the
skills previously shown as a logo marquee (now a typographic list), the physics
degree, the employment history from the resume, the acapella detail, and the GA4
property.

**Rebuilt as first-class pages.** The Bodyweight Tracker and Tap BPM apps were
ported from Quasar to React. Both keep their original URLs (`/weighttracker`,
`/tapbpm`) because the GitHub repositories link to them. The tracker gained unit
switching, sample data, real validation and a dependency-free chart; the old
version used ApexCharts and `alert()` for errors.

**Dropped.** The logo marquee, the stock hero illustration, the geometric
background pattern, and the resume PDF viewer (which pulled in a 15 MB vendored
copy of pdf.js for a page that was commented out anyway).

**Rangouts** is listed under experience as "Software Developer" rather than
"Software Developer (Cofounder)" as on the resume. It shut down in 2023 and is
described in the past tense with no product-status or business framing. See the
note below if you would rather it came off entirely.

## Things to review before merging

1. **Private pages from the old site are gone, on purpose.** `/pr`, `/aor`,
   `/jobprobation`, `/episodes` and `/surprise` were publicly reachable on
   production. Between them they exposed immigration status and filing dates, an
   employment probation tracker, a named individual's health data, a personal
   message, and your in-office versus work-from-home schedule. None of it
   belongs on a public professional site and none of it was carried over. The
   pages still exist on `main` if you want them; host them somewhere private.
   After cutover those URLs will 404, which is the correct signal for search
   engines to drop them.
2. **The resume PDF is not published.** It contains a phone number and the
   cofounder title. Add it back deliberately if you want it, ideally with the
   phone number removed. `/resume` currently 301s to `/about`.
3. **ZenuQR is not mentioned.** The old site described it in one line with no
   link and the domain no longer resolves. It was excluded because it was not
   clear whether it is dormant or ongoing. Say the word and it can go into the
   work list.
4. **Dead links audited.** `rangouts.com`, `instatixapp.com` and `zenuqr.com` all
   fail to resolve. None of them are linked anywhere on the new site.
5. **Copy accuracy.** The home page says the scheduling system serves "about a
   million people" and the work page says "roughly a million", both taken from
   your resume. Check you are comfortable with that phrasing being public.
6. **Analytics.** The GA4 measurement id was carried over unchanged. Remove the
   two `<Script>` tags in `src/app/layout.tsx` if you no longer want it.

## Deployment

Netlify already serves `www.ravinojuwono.com` from this repository, with the
apex domain redirecting to `www`. The build settings previously lived in the
Netlify UI; they now live in `netlify.toml`, which takes precedence.

Cutover:

1. Push the `rebuild/nextjs` branch and let Netlify build a deploy preview.
2. Check the preview, especially `/weighttracker` and `/tapbpm`.
3. Merge to `main`. Netlify builds and publishes.

Rollback is a Netlify "publish deploy" on the last Quasar build, or
`git revert` of the merge. `main` is untouched until you merge, and the old
implementation stays in `legacy-quasar/` either way. Delete that directory once
you are confident the replacement is doing its job.

## Verified

`npm run check` passes: no type errors, no lint errors, clean build.
`npm audit` reports zero vulnerabilities.

Measured locally against the production export at 1440x900 and 390x844:

- LCP equals FCP on every page (32 to 52 ms), because nothing above the fold
  waits on JavaScript.
- Cumulative layout shift is 0.
- Roughly 111 KB transferred on first load, most of it the two webfonts.
- No horizontal overflow at 390 px, no console errors, no failed requests.
- Every text colour clears WCAG AA against the background: 17.3:1 for body ink,
  6.8:1 for muted text, 4.8:1 for the faint metadata labels.
- Keyboard: skip link, visible focus rings throughout, mobile menu traps focus,
  closes on Escape and returns focus to its trigger.
