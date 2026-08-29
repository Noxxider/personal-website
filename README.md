# ravinojuwono.com

Personal site for Ravino Juwono. Next.js App Router, TypeScript, Tailwind CSS v4,
deployed on Vercel. A public site, plus a password-gated private area at
`/private` for personal tools.

```bash
npm install
npm run dev     # http://localhost:3000
npm run check   # typecheck + lint + test + build
npm test        # the citizenship presence maths
```

`/private` needs two variables locally. Put them in `.env.local`:

```
PRIVATE_USER=vino
PRIVATE_PASSWORD=something-long
```

## Architecture

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16, App Router |
| Rendering | Public routes prerendered to HTML at build time. Only `/private` is server rendered per request. |
| Auth | HTTP Basic Auth in `src/middleware.ts`, credentials from environment variables |
| Styling | Tailwind v4 with tokens in `@theme` inside `src/app/globals.css`. No config file. |
| Components | shadcn/ui primitives (`button`, `input`, `label`, `sheet`, `dialog`) on Radix, everything else composed by hand |
| Icons | Seven inline SVGs in `src/components/icons.tsx`. No icon package. |
| Charts | Hand-drawn SVG and CSS. No charting library. |
| Spreadsheets | `read-excel-file`, loaded on demand. The npm `xlsx` package is stuck on a release with known CVEs. |
| Analytics | The existing GA4 property, loaded `afterInteractive`. Nothing else. |
| Deployment | Vercel, project `noxxiders-projects/ravinojuwono` |

Runtime dependencies: `next`, `react`, `react-dom`, `@radix-ui/react-dialog`,
`read-excel-file`, `server-only`, and the `clsx` / `tailwind-merge` /
`class-variance-authority` trio shadcn uses.

```
src/
  app/                 public routes
  app/private/         gated routes, never prerendered or cached
  components/          layout shell and page primitives
  components/private/  the personal tools
  components/ui/       shadcn primitives, restyled to the token set
  content/             public copy and data (site.ts, work.ts)
  private/             personal data and logic, server-only where it matters
  middleware.ts        the Basic Auth gate
legacy-quasar/         the previous Quasar site, kept for reference
```

## How the private area stays private

Three things have to hold, and all three are checked in the build:

1. **The route is gated.** Middleware matches `/private` and `/private/:path*`,
   which covers the HTML, the RSC payloads and any prefetch. It fails closed: a
   missing `PRIVATE_USER` or `PRIVATE_PASSWORD` returns 401 rather than opening
   the area up.
2. **The data never reaches a public chunk.** `src/private/schedule.ts` imports
   `server-only`, so the build fails if a client component ever imports it. The
   dates are read in a server component and passed as props, which puts them in
   the RSC payload for a gated route rather than in a JavaScript bundle that
   anyone can fetch.
3. **Nothing is indexed.** `noindex, nofollow` on the layout and as a response
   header, and `robots.txt` deliberately does not mention `/private`, since
   listing it would advertise the path to anyone reading the file.

Verified after each build: no personal date, name or clinical note appears
anywhere under `.next/static`, and every private path returns 401 without
credentials.

## Design

Warm paper ground, near-black ink, one signal colour (a deep rust) used
sparingly for links on hover, live markers, focus rings and errors. Instrument
Serif for display type, Inter Tight for everything else, and the system
monospace stack for metadata. Both webfonts are self-hosted by `next/font`, so
the page makes no third-party font request.

One committed light theme, no toggle. Motion is a short fade-and-rise on scroll
that never applies above the fold, so hero content is not waiting on hydration.
`prefers-reduced-motion` disables it and a `<noscript>` style keeps everything
visible without JavaScript.

## Content decisions

**Kept and rewritten.** The name, location, LinkedIn, GitHub, the skills that
used to be a logo marquee (now a typographic list), the physics degree, the
employment history, the acapella detail, and the GA4 property.

**Rebuilt as first-class pages.** Bodyweight Tracker and Tap BPM were ported
from Quasar to React and keep their original URLs, because the GitHub
repositories link to them.

**Removed from the public site.** The email address, the location, the logo
marquee, the stock hero illustration, the background pattern, and the resume
PDF viewer with its 15 MB vendored copy of pdf.js.

**Location.** No city or region appears anywhere: not in the copy, the titles,
the descriptions, the social image or the JSON-LD, which no longer carries a
postal address. The degree is credited to "University of British Columbia"
rather than naming the Okanagan campus, which is accurate and does not point at
a particular city. Two things still narrow it down and were kept because they
carry the professional positioning: the employer, and the health region it
serves. Say the word if either should go.

**Rangouts** is listed under experience as "Software Developer" rather than
"Software Developer (Cofounder)" as on the resume. It shut down in 2023 and is
described in the past tense with no business framing.

## Things to review

1. **The domain expires on 19 September 2026.** Renewal comes before anything
   else. See below.
2. **The private tools replaced two obsolete ones.** The eCOPR countdown and the
   AOR forecast are gone, since both events have happened. Their data, including
   the office schedule and booked leave, was deleted rather than carried over.
3. **Trips are stored per browser.** `localStorage`, seeded from
   `knownAbsences` in `src/private/schedule.ts`. Add trips to that file to make
   them permanent across devices; anything added through the dialog lives only
   in the browser that added it. If cross-device sync matters, a free Neon or
   Upstash store through the Vercel marketplace is about an hour of work, but it
   needs you to click through the integration.
4. **The citizenship figure is an estimate.** It implements the 1,095 day rule
   with the half-day pre-PR credit capped at 365, and counts departure and
   return days as days in Canada, which is IRCC's convention. `npm test` covers
   the maths. The official number is whatever IRCC's own calculator says.
5. **Analytics.** Remove the two `<Script>` tags in `src/app/layout.tsx` if you
   no longer want GA4.

## Deployment

Vercel project `ravinojuwono`, connected to this GitHub repository. Pushes to
`main` deploy to production; other branches get previews.

```bash
npm run check        # must pass first
npx vercel deploy    # preview
npx vercel deploy --prod
```

Environment variables `PRIVATE_USER` and `PRIVATE_PASSWORD` are set for
production, preview and development. Rotate the password with
`npx vercel env rm PRIVATE_PASSWORD production` then `env add`.

**`main` still holds the Quasar site**, so a push to `main` before merging this
branch will fail the Vercel build. Harmless, but expect the email.

### Moving the domain

The site is still served from Netlify. Nothing about the live site has changed.
Order matters here because of the expiry date:

1. **Renew at GoDaddy first.** The domain expires 19 September 2026 and the
   transfer lock is on. A registrar transfer takes up to five days to settle,
   which is uncomfortably close. Renewing first removes the risk, and the year
   you pay for carries over to Cloudflare.
2. **Point DNS at Cloudflare.** Add the site in Cloudflare, let it import the
   existing records, then change the nameservers at GoDaddy from
   `ns49/ns50.domaincontrol.com` to the pair Cloudflare gives you. Cloudflare
   Registrar requires the domain to be on its nameservers before it will accept
   a transfer.
3. **Transfer the registrar.** Unlock the domain at GoDaddy, get the EPP
   authorisation code, then start the transfer from Cloudflare. Their pricing is
   at cost and WHOIS redaction is included, so your name, address, phone number
   and email come off the public record. That was the other half of removing
   personal contact details.
4. **Attach the domain in Vercel** and follow the DNS records it asks for. Keep
   `www.ravinojuwono.com` as the primary with the apex redirecting to it, which
   is what the canonical tags and `robots.txt` already assume.
5. **Then, and only then, delete the Netlify site.** While both exist you can
   roll back by pointing DNS back.

## Verified

`npm run check` passes: no type errors, no lint errors, 9 tests passing, clean
build. `npm audit` reports zero vulnerabilities.

Measured against the production build at 1440x900 and 390x844:

- LCP equals FCP on every public page (32 to 52 ms).
- Cumulative layout shift is 0.
- Around 111 KB transferred on first load, most of it the two webfonts.
- No horizontal overflow at 390 px, no console errors or warnings.
- Every text colour clears WCAG AA: 17.3:1 body, 6.8:1 muted, 4.8:1 metadata.
- Keyboard: skip link, visible focus rings, mobile menu and dialog both trap
  focus, close on Escape and restore focus to their trigger.
- Live on Vercel: every public route 200s, every private route 401s without
  credentials and 200s with them.
