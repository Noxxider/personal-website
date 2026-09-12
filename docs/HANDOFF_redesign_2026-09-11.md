# Handoff: redesign of ravinojuwono.com as a scroll-driven 3D site

Written 2026-09-11 for a fresh Claude Code session opened in `C:\Vino\Projects\personal-website`.
Read this whole file, then `README.md`, then start at **Execution order** at the bottom. Nothing in
this file has been built yet; the current site is the warm paper, Instrument Serif, light-theme
Next.js site described in the README and shown in `home-v4.png`.

---

## 1. What Vino asked for, in his words, tidied

> Redo my personal site. Not a walk-around Three.js world, but a **3D hero** and, as you scroll,
> **animation like Apple's product pages**: the expensive, ten-to-hundred-thousand-dollar kind of
> site. Dark. Something with **planet Earth** that, as you scroll, **zooms in to Canada**. Then
> sections for the things I am: **physics and software**, **scheduling / IT work** (I keep a health
> region's scheduling systems running), **web development**, and off the clock **hockey** and
> **Tower of God** (my favourite thing to read). **Symbols for LinkedIn and GitHub that float in
> 3D** and can be clicked. Text as usual between. Something **physics-related** as part of the
> site, because I do physics and software. Add **small apps** to show scale: front-end only or with
> a backend, multiple if you like. **Experience** can be its own page. A section like **"if you want
> me to build something, let me know"** that goes to the existing contact form, and it can include
> **workflows** I could automate for people (compliance, anything TypeScript, MCP, sky's the limit)
> and a "genuinely make something for you" page. Feel free to **redesign everything**: nav, pages,
> what is on each page, how many. **Choose the font, colour theme, everything.** Tools you have:
> Vercel CLI, Chrome for testing, Docker, a Vercel backend, Neon if it is free.

And the constraints he put on it, which override taste:

- **No photo of him.** Anywhere.
- **No personal information.** No email on the page (the form is the contact path), no location
  finer than **Canada**. The README already removed every city/region reference; keep that. The
  Earth zoom stops at Canada. It does not land on a city, a province outline is fine.
- **Plausible deniability toward his employer.** The site implies what he *could* build for you. It
  never says he is *actively building* a company or a product on the side, never names Tuntas,
  Holdkey or Kaibre, never mentions clients, revenue, or "my startup". Capabilities, not ventures.
  (Commit `094fdf6` already reframed copy "away from active building"; keep that discipline.)
- **Not "ChatGPT-style".** No AI-generated look: no gradient-blob hero, no "AI-powered" copy, no
  emoji, no "Let's connect!", no stock 3D robots. Restraint is the brand.
- The employer name and the health-region framing stay (they carry the professional positioning);
  everything else about work is described by what it does, not where.

## 2. Decisions taken here so the next session does not relitigate them

**Keep**: Next.js 16 App Router, TypeScript, Tailwind v4, Vercel project `noxxiders-projects/ravinojuwono`,
the Resend contact form (server action, key server-side), the Basic-Auth `/private` area exactly as
it is (do not touch `src/middleware.ts`, `src/private/`, `src/app/private/`), the two ported tools at
their URLs (`/weighttracker`, `/tapbpm`, GitHub links point at them), GA4 id, robots/sitemap
behaviour, the no-third-party-fonts rule (self-host with `next/font`).

**Replace**: the light paper theme, Instrument Serif/Inter Tight, the flat page structure, the
scroll fade-and-rise. Everything visible.

**Theme: "night flight".** Dark, cinematic, one signature colour.
- Ground `#0A0D12` (not pure black; lets the Earth's atmosphere glow read). Surface `#11161E`.
- Ink `#E8ECF1`, muted `#8B95A5`, rule `#1E2530`.
- Signature: **atmosphere teal** `#5FD3E6` for the Earth rim, links, live markers, focus rings.
- One warm counter: **rink amber** `#F2A65A`, used only on primary CTAs and the hockey section.
- No other hues. Status colours only inside the apps.
- `prefers-color-scheme: light` is **not** supported: one committed dark theme, like the current
  site committed to one light one. State it in the README.

**Type.**
- Display: **Fraunces** (variable; use the optical-size and "WONK" axes sparingly for the hero).
- Text and UI: **Geist**. Metadata and numbers: **Geist Mono**. All three via `next/font` from
  Google or vendored; no runtime font requests.
- Scale: hero 96/112 desktop, 56 mobile; section heads 40; body 17/28; captions 13 mono.

**Motion.**
- **Lenis** for smooth scroll + **GSAP ScrollTrigger** (free since 2025) for timelines. Framer Motion
  only for small UI state if needed; do not use two scroll engines.
- **React Three Fiber + drei + three** for the 3D. One `<Canvas>` fixed behind the page for the
  hero chapter, mounted client-only with a static poster (`public/poster-earth.jpg`) rendered on the
  server so first paint never waits on WebGL. `frameloop="demand"` outside animated ranges.
- `prefers-reduced-motion`: every scroll timeline collapses to its end state; the Earth is a still
  render; nothing auto-plays. A `<noscript>` style keeps all text visible.
- Budget: LCP < 2.5 s on a mid phone, total JS on `/` under 350 kB gzipped *before* the 3D chunk,
  which lazy-loads; the Earth textures are 2K max (NASA Blue Marble, public domain), KTX2/basis if
  size bites. Lighthouse mobile performance >= 85, accessibility >= 95.

**Information architecture** (nav is five items, nothing more):

```
/            The film. Hero Earth, then the chapters, then the offer.
/work        Everything built, with the two live tools and the playground apps.
/experience  Own page. Timeline, what each role actually did, the degree.
/build       "Want something built?" The workflow menu and the form.
/contact     The form alone (kept for old links; /build links here too).
/private     Unchanged, gated, unlisted.
```

## 3. The home page as a film: chapter by chapter

Each chapter is a full-viewport "scene" pinned by ScrollTrigger; text panels slide in over the
canvas. Total scroll length about 8 viewports on desktop.

**Chapter 0, arrival (0.0 to 1.0).** Black. The name in Fraunces, small, top-left. The Earth fades
in from the dark, night side toward the viewer, city lights on (Blue Marble night texture),
atmosphere rim in teal. One line of text: what he does, present tense, no location:
*"I keep the scheduling systems a health region runs on, and I build for the web."*

**Chapter 1, the zoom (1.0 to 2.5).** Scroll drives the camera: the Earth rotates so North America
faces us, day side, and the camera pushes in until **Canada** fills the frame with a thin outline
drawn on (GeoJSON of the country, extruded as a subtle line on the sphere). Stop there. Caption:
*"Canada"* in mono. No pin, no city.

**Chapter 2, systems (2.5 to 4.0).** The globe recedes to a small disc in the corner and stays as a
motif. A **schedule grid** builds itself in 3D: a week of slots as thin bars rising from a plane,
bookings filling in, one slot turning amber and being re-flowed (the "when a clinic cannot book a
patient, people notice" line from the current site earns its place here). Text: the clinical
informatics role, described by outcome. Keep the employer name; keep the "about a million people"
line from the current copy, it is the strongest sentence on the site.

**Chapter 3, physics (4.0 to 5.5).** The bars become particles. A real **N-body / orbital
integrator** runs in the canvas (Verlet, three to six bodies, deterministic seed) and the text
explains that the degree is physics and the habit is measurement: *"I studied physics. It left me
with one habit: measure, then decide."* This is also the first **app**: the sim is interactive on
hover/drag and links to `/work/orbits` where it has controls.

**Chapter 4, web (5.5 to 6.5).** Three floating **glass cards** (the two live tools and one
playground app) tilt with the pointer, each a real screenshot on a plane with a soft depth shadow.
Text: what he builds for the web and how (real HTML at build time, small pages, accessible).

**Chapter 5, off the clock (6.5 to 7.5).** Split scene. Left: a **puck** slides across dark ice
and rebounds off boards, rink amber, the only warm thing on the page; text: hockey. Right: a
**stack of pages** turning in 3D with the words *"Tower of God"* set in Fraunces, no cover art (no
rights to it), one line about it being the thing he reads. Keep this chapter short and human.

**Chapter 6, the symbols (7.5 to 8.0).** The **LinkedIn and GitHub marks** as two chunky extruded
3D glyphs drifting in space, magnetised to the pointer, each a real link (`<a>` in the DOM layered
over the canvas, the 3D is decoration; keyboard users get the same links). The page settles.

**Chapter 7, the offer (static, after the canvas).** *"Want something built?"* Three cards:
**a workflow automated** (approvals, reporting, compliance checks, anything a spreadsheet is doing
badly), **a tool for your team** (internal apps, dashboards, integrations), **a fast public site**.
One button to `/build`. No prices on the home page.

Footer: name, the five nav links, LinkedIn, GitHub. No email.

## 4. The other pages

**/work.** Grid of everything, filterable by Live / Playground / Archived. Each entry: screenshot,
one blurb line, stack chips, links. Add the **playground apps** built for this redesign, each a real
route with its own page and a "how it is built" paragraph:

1. `/work/orbits`: the N-body sim from chapter 3, with sliders for mass, timestep, integrator
   (Euler vs Verlet, to show why it matters), and a "energy drift" readout. Front-end only.
2. `/work/shift`: a small **scheduling** toy: drop shifts on a week, it flags conflicts and
   coverage gaps, exports iCal. Front-end only; the domain is his day job, so keep it generic and
   never reference the employer's systems.
3. `/work/pendulum`: double pendulum with trail and a chaos demonstration (two pendulums, 0.001 rad
   apart, diverging). Cheap, striking, physics.
4. Keep `/weighttracker` and `/tapbpm` as they are (restyle only).
5. Optional, if time: one app with a backend on Vercel functions + Neon free tier, e.g. a public
   "uptime of this site" page that stores its own pings. Only if Neon is free and needs no card.

**/experience.** A timeline in mono: Interior Health Authority (2024 to present, Clinical
Informatics Analyst, the same copy as now), earlier roles from the current `/about`, Rangouts as
"Software Developer" past tense with no business framing (README rule), the physics degree credited
to "University of British Columbia" with no campus. No dates finer than year-month. A short "how I
work" paragraph. No download of a resume PDF (removed on purpose earlier).

**/build.** The page that pays. Heading: *"If you want something built, say so."* Sections:
- What kinds of things: workflows automated (approval chains, report generation, data checks,
  compliance checklists), internal tools, integrations and MCP servers for teams that use Claude or
  similar, public sites that load fast. TypeScript first; Python where it fits.
- How it goes: a 20-minute call, a written scope with a fixed price, delivery in weeks, a month of
  support. No prices listed; say "fixed price, agreed before work starts".
- The **form**: reuse `src/components/contact-form.tsx` and its server action, with two extra
  fields: "What would you like built?" (select: workflow / tool / site / not sure) and "Rough
  timeline". Same Resend delivery. Keep the README's shared-sender caveat in mind when testing.
- Plausible deniability check: this page describes services, not a company. No "we", no brand
  name, no client logos, no case studies of anything unreleased.

**/contact.** The plain form, unchanged behaviour, restyled.

## 5. Tech notes and traps

- Add: `three`, `@react-three/fiber`, `@react-three/drei`, `gsap`, `lenis`. Do not add a UI kit; the
  shadcn primitives already in the repo are enough.
- The `<Canvas>` must be a client component behind `next/dynamic` with `ssr: false` **and** a
  server-rendered poster underneath, so `/` still prerenders to HTML and the LCP is the poster.
- ScrollTrigger + Lenis: call `lenis.on('scroll', ScrollTrigger.update)` and `gsap.ticker.add`
  once, in a client provider, and kill everything on unmount; the App Router re-mounts on nav.
- Textures: 2048x1024 day, night and specular maps from NASA Visible Earth (public domain; credit
  in the README). Load them via drei `useTexture` inside `Suspense`, poster visible until then.
- Country outline: Natural Earth 1:110m GeoJSON for Canada, converted to a line on the sphere
  (lat/long to xyz). Do not ship the whole world file; extract one feature at build time.
- Reduced motion and no-WebGL (`!gl` in `Canvas` `fallback`) both show the poster and the text.
- Keep public routes static: no runtime env reads in server components on `/`, `/work`, `/build`.
- Accessibility: every 3D element is decorative (`aria-hidden`), every interactive thing has a real
  DOM control; chapters are `<section>` with headings so a screen reader gets the same story.
- Analytics: keep GA4, add nothing else.

## 6. Verification, in this order, before calling any phase done

1. `npm run check` (typecheck, lint, tests, build). Add unit tests for the sims (energy drift bound
   for Verlet; conflict detection for the shift toy).
2. Chrome (the pane) at 390 x 844 and 1440 x 900: every chapter reaches its end state by scroll;
   nothing overflows horizontally; the poster shows before the canvas; reduced-motion emulation
   shows a complete static page.
3. Lighthouse mobile on `/`: performance >= 85, accessibility >= 95, no third-party font request,
   3D chunk not in the initial bundle.
4. `npm run build` and confirm `.next/static` contains no string from `src/private/` (the README's
   standing check).
5. The `/build` form delivers to the Resend inbox end to end (the existing `contact-v3.png` shows
   the last verified state).
6. Deploy with `vercel --prod` from this directory; confirm the production URL renders the poster
   within 2.5 s on a throttled mobile profile.

## 7. Execution order (each phase deployable on its own)

1. **Theme and type first, no 3D.** Tokens in `globals.css`, Fraunces/Geist/Geist Mono via
   `next/font`, dark layout, restyled header/footer, all existing pages re-skinned. Deploy.
2. **Poster hero + Lenis + ScrollTrigger scaffolding** with placeholder chapters as plain text.
   Deploy. (The site is already better than today at this point.)
3. **Earth.** Canvas, textures, atmosphere, Canada line, the zoom timeline. Deploy.
4. **Chapters 2 to 6**, one per commit, each verified in Chrome. Deploy after each.
5. **/build** page and the extended form. Deploy.
6. **Playground apps**: orbits, pendulum, shift. Each its own route and commit. Deploy.
7. **/experience** page. Deploy.
8. README rewrite: architecture, the credits (NASA, Natural Earth), the reduced-motion story, and
   the content rules restated (no photo, no location below Canada, no ventures, no email).

Commit small, on `main`, messages in the repo's existing style (`feat:`, `docs:`, `perf:`, plain
lowercase, with the Claude co-author trailer). Push after each deployable phase.

## 8. Things not to do

- Do not add a light theme, a theme toggle, a blog, testimonials, a newsletter, or a chatbot.
- Do not put Tower of God artwork, the Crunchyroll/Webtoon logo, or NHL/team marks on the page.
  Words only for the fandom; a generic puck and rink for hockey.
- Do not mention any product he is building, any company, any client, any revenue.
- Do not touch `/private`, `src/private/`, or the middleware.
- Do not use an email address anywhere in the DOM.
- Do not let the 3D block first paint or scroll on a phone. If it ever does, the poster wins.
