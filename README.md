# ravinojuwono.com

Personal site for Ravino Juwono. Next.js App Router, TypeScript, Tailwind CSS v4,
React Three Fiber, deployed on Vercel. A public site with a scroll-driven 3D
front page and four small apps, plus a password-gated private area at
`/private` for personal tools.

```bash
npm install
npm run dev     # http://localhost:3000
npm run check   # typecheck + lint + test + build
npm test        # the simulations, the shift checks, the citizenship maths
node scripts/build-globe.mjs   # regenerate the Earth outline and country data
```

Environment variables, in `.env.local` locally and in the Vercel project for
deploys:

```
PRIVATE_USER=vino              # the /private gate
PRIVATE_PASSWORD=something-long
RESEND_API_KEY=re_...          # the contact and build forms
CONTACT_TO=you@example.com     # where messages land
CONTACT_FROM=noreply@your-domain   # optional, see below
DATABASE_URL=postgres://...    # optional: Neon, for /work/hello only
```

## Architecture

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16, App Router |
| Rendering | Public routes prerendered to HTML at build time. `/private` and `/work/hello` are server rendered per request. |
| Auth | HTTP Basic Auth in `src/middleware.ts`, credentials from environment variables |
| Styling | Tailwind v4 with tokens in `@theme` inside `src/app/globals.css`. No config file. |
| Components | shadcn/ui primitives (`button`, `input`, `label`, `sheet`, `dialog`) on Radix, everything else composed by hand |
| 3D | `three`, `@react-three/fiber`, `@react-three/drei`. One canvas on the front page, one per app that needs it. |
| Scroll | Lenis for smooth scroll, GSAP ScrollTrigger for the timelines. One engine, wired once in `ScrollProvider`. |
| Icons | Inline SVGs in `src/components/icons.tsx`. No icon package. |
| Data | Neon Postgres over HTTP (`@neondatabase/serverless`) for one table, `hellos`. Absent, the app runs in preview mode. |
| Contact | Server Action posting to the Resend API. The address and key stay server side. |
| Analytics | The existing GA4 property, loaded `afterInteractive`. Nothing else. |
| Deployment | Vercel, project `noxxiders-projects/ravinojuwono` |

```
src/
  app/                 public routes: /, /work, /work/*, /experience, /build, /build/example, /contact
  app/private/         gated routes, never prerendered or cached
  components/film/     the front page film: scenes, motion, shared scroll state
  components/apps/     the four playground apps
  components/          layout shell and page primitives
  components/private/  the personal tools
  components/ui/       shadcn primitives, restyled to the token set
  content/             copy and data (site.ts, work.ts, globe.json, countries.json)
  lib/sims/            the N-body and double pendulum integrators, with tests
  lib/shift.ts         the shift scheduling checks and iCalendar export, with tests
  private/             personal data and logic, server-only where it matters
  middleware.ts        the Basic Auth gate
scripts/build-globe.mjs  turns Natural Earth data into the outline and centroid files
docs/                  the redesign handoff
legacy-quasar/         the previous Quasar site, kept for reference
```

## The front page

The home page is a film. Five pinned chapters, then a static offer:

| # | Chapter | On the canvas |
| --- | --- | --- |
| 00 | Arrival | A textured Earth, lit from the left, idling right of the name |
| 01 | Canada | The sun comes round, the Earth turns and pushes in until Canada fills the frame, outline drawn on |
| 02 | Systems | A week of appointment slots rising as bars; one turns amber and is re-flowed |
| 03 | Physics | A velocity Verlet N-body with trails; the pointer tugs the bodies |
| 04 | Web | Screenshot cards of the apps, stacked in depth, tilting toward the pointer |
| 05 | The offer | Static. Three things I build, a button to `/build`, and the LinkedIn and GitHub links |

How it is put together:

- Each chapter is a `<section>` taller than the viewport with a `position: sticky`
  stage inside. Scrolling through the section holds the stage still. Consecutive
  chapters overlap by 45svh so the next stage slides over while the previous one
  is still pinned, and there is never an empty frame.
- `FilmMotion` creates one scrubbed GSAP timeline per chapter for the text and
  three plain ScrollTriggers (enter, pin, exit) that write into a shared, mutable
  store (`film-state.ts`). The 3D scenes read that store every frame and decide
  for themselves whether they are on stage. Nothing re-renders on scroll.
- One `<Canvas>`, fixed behind the film, loaded as a lazy chunk behind a
  server-rendered poster (`public/poster-earth.jpg`, plus a phone crop). A loading
  screen covers the page while the Earth's maps arrive and lifts on the first
  drawn frame, or after eight seconds, whichever comes first.
- The header reads the current chapter from the same store and lights a
  five-segment rail as the film plays; over the bright Arctic zoom it goes solid.
- On phones each chapter's text is pinned to the top of its stage, the edge that
  enters the viewport first, with the visual in the lower half, so no frame is
  ever picture-only.

**Reduced motion and no WebGL.** Nothing 3D mounts. The chapters collapse to a
plain stacked page with every line visible, the poster stands in for the Earth,
and reveals elsewhere on the site are visible by default: they only start hidden
once the scroll provider has confirmed that JavaScript is running and motion is
welcome (`html.motion-ok`). Without JavaScript the whole site reads top to
bottom.

**The Earth.** Day map: NASA Blue Marble (public domain), resized to 4096x2048.
Night lights, water mask and clouds: the NASA-derived 2K set that ships with the
three.js examples (MIT), re-encoded as WebP. About 1.2 MB in all, fetched after
first paint. The Canada outline and the country centroids come from Natural
Earth 1:110m (public domain) through `scripts/build-globe.mjs`. The shader blends
day and night by a sun direction that moves with scroll, adds a specular glint on
water, and a teal rim; the atmosphere is a slightly larger sphere drawn on its
back faces.

## The apps

Each is a real program at its own route, with notes on the page.

- **Orbits** (`/work/orbits`): a gravitational N-body in the browser. Switch between
  forward Euler and velocity Verlet and watch the energy drift readout. Press and
  drag to add a passing mass. Integrators in `src/lib/sims/nbody.ts`; the tests
  assert Verlet's drift stays bounded and Euler's does not.
- **Double pendulum** (`/work/pendulum`): two pendulums released a chosen fraction of
  a radian apart, fourth-order Runge–Kutta, a divergence readout and strip.
- **Shift** (`/work/shift`): a week board. Lay shifts by dragging, and it flags
  double-bookings, short rests, hours without cover and over-hours as you go,
  then exports the week as an `.ics`. Checks and export in `src/lib/shift.ts`.
- **Hello from** (`/work/hello`): a shared globe. One press adds a light at your
  country. Only the country code from the edge (`x-vercel-ip-country`) is read,
  and only a count per country is stored. Needs `DATABASE_URL`; without it the
  page runs in preview mode and says so.

The two 2024 tools, Bodyweight Tracker and Tap BPM, stay at `/weighttracker` and
`/tapbpm` because their GitHub repositories link there, but they are no longer
listed.

## Design

"Night flight." A dark ground that is not quite black (`#0A0D12`), light ink,
and one signature colour, an atmosphere teal (`#5FD3E6`), for links, live
markers, focus rings and selection. One warm counter, a rink amber
(`#F2A65A`), is reserved for primary buttons and the one re-flowed booking. No
other hues outside the apps. Fraunces for display type (variable, with the
`opsz` and `WONK` axes), Geist for text and interface, Geist Mono for metadata
and numbers. All three are self-hosted by `next/font`, so the page makes no
third-party font request.

One committed dark theme, no toggle; `prefers-color-scheme: light` is not
supported.

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

## Content rules

These are deliberate and should survive future edits:

- **No photo** of the owner, anywhere.
- **No location finer than Canada.** The Earth zoom stops at the country. No
  city, no province, no postal address in the JSON-LD. The degree is credited to
  "University of British Columbia" without a campus. The employer and the health
  region it serves are kept because they carry the professional positioning.
- **No email address in the DOM.** The forms are the contact path.
- **Capabilities, not ventures.** The site describes what can be built for you.
  It never names a company, product, client or revenue the owner has on the
  side, and "Rangouts" is listed as a past developer role with no business
  framing.
- **Restraint.** No light theme, no toggle, no blog, testimonials, newsletter or
  chatbot. No fandom artwork or team marks. Hockey and the rest of life stay
  off the page.

## Things to review

1. **Neon.** `/work/hello` needs the Neon integration on the Vercel project so
   `DATABASE_URL` is set for production, preview and development. Until then the
   page runs in preview mode. The table is created on first use.
2. **The contact and build forms send from Resend's shared sender.** `CONTACT_FROM`
   is unset, so messages go out as `onboarding@resend.dev`. That delivers only to
   the address that owns the Resend account. If `CONTACT_TO` ever changes,
   delivery stops until `CONTACT_FROM` points at a domain verified in Resend.
3. **The private tools** are unchanged from the previous version of this README's
   notes: trips are stored per browser, the citizenship figure is an estimate,
   and GA4 can be removed by deleting the two `<Script>` tags in the root layout.
4. **The social image** (`public/og.png`) still shows the previous light design.

## Deployment

Vercel project `ravinojuwono`. The Next.js site lives on the `rebuild/nextjs`
branch; `main` still holds the old Quasar site, so production is deployed from
this directory with the CLI:

```bash
npm run check        # must pass first
npx vercel --prod
```

Environment variables are set for production, preview and development. Rotate
the private password with `npx vercel env rm PRIVATE_PASSWORD production` then
`env add`.

### Domain

Registered with Cloudflare, on Cloudflare nameservers, serving from Vercel.
The apex 308s to `www`, which is the canonical host the metadata assumes.
Expires 19 September 2027. WHOIS is redacted.
