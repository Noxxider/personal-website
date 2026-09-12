export type Project = {
  slug: string;
  title: string;
  /** Short line used on cards and in the work index. */
  blurb: string;
  /** Longer description used on the project page itself. */
  description: string;
  year: string;
  status: "Live" | "Playground" | "Archived";
  href: string;
  repo?: string;
  stack: string[];
  /** Screenshot of the real thing, captured from the running tool. */
  image?: { src: string; width: number; height: number; alt: string };
  /** Kept reachable at its URL for old links, but not listed anywhere. */
  hidden?: boolean;
};

/**
 * Everything publicly linkable. The playground apps are small, real
 * programs built to show range: each has its own route and its own notes.
 */
export const projects: Project[] = [
  {
    slug: "orbits",
    title: "Orbits",
    blurb:
      "A gravitational N-body lab. Change the integrator and watch the energy drift, or fail to.",
    description:
      "Five bodies under gravity, integrated in real time in the browser. The point is the comparison: symplectic integrators such as velocity Verlet keep the total energy bounded over millions of steps, while plain Euler bleeds energy until orbits spiral away. A readout tracks the drift live so you can see the difference rather than take it on faith. Drag on the canvas to add a passing mass and see the system react.",
    year: "2026",
    status: "Playground",
    href: "/work/orbits",
    stack: ["TypeScript", "React Three Fiber", "Velocity Verlet"],
    image: { src: "/work/orbits.png", width: 744, height: 465, alt: "Five bodies and their trails in the N-body lab, with the energy drift readout" },
  },
  {
    slug: "pendulum",
    title: "Double pendulum",
    blurb:
      "Two pendulums released a thousandth of a radian apart, and how quickly they stop agreeing.",
    description:
      "A double pendulum is the classic small system with chaotic motion. Two copies run side by side from nearly identical starting angles, with a divergence readout that shows when their paths part ways. The equations are integrated with fourth-order Runge–Kutta at a fixed step, the trails are drawn on canvas, and every control is keyboard reachable.",
    year: "2026",
    status: "Playground",
    href: "/work/pendulum",
    stack: ["TypeScript", "Canvas", "Runge–Kutta 4"],
    image: { src: "/work/pendulum.png", width: 744, height: 465, alt: "Two double pendulums, teal and amber, with their trails and the divergence strip" },
  },
  {
    slug: "shift",
    title: "Shift",
    blurb:
      "Drop shifts on a week. It flags overlaps and coverage gaps as you go and exports the result as a calendar.",
    description:
      "A small scheduling toy in the spirit of the day job, kept generic on purpose. Add people, drag shifts onto a week, and the board checks for double-bookings, rest gaps and hours without cover the moment anything changes. Export produces a standard iCalendar file that opens in any calendar app. Everything runs in the browser; nothing is stored anywhere but your tab.",
    year: "2026",
    status: "Playground",
    href: "/work/shift",
    stack: ["TypeScript", "Constraint checks", "iCal export"],
    image: { src: "/work/shift.png", width: 760, height: 540, alt: "The shift board: a week of shifts with issues listed beside it" },
  },
  {
    slug: "hello",
    title: "Hello from",
    blurb:
      "Leave a light on the globe from wherever you are. Country only, nothing else is kept.",
    description:
      "A shared globe. Press the button and a light appears at your country's location for everyone who visits after you. The server reads only the country from the request, never the address, and stores a count per country in a Postgres table on Neon. The globe is the same one from the front page, rendered in React Three Fiber, with the lights placed at country centroids.",
    year: "2026",
    status: "Live",
    href: "/work/hello",
    stack: ["Next.js", "Neon Postgres", "React Three Fiber"],
    image: { src: "/work/hello.png", width: 744, height: 512, alt: "The shared globe with lights standing at countries" },
  },
  {
    slug: "site",
    title: "This site",
    blurb:
      "A scroll-driven film in React Three Fiber on a static Next.js shell, with a real Earth in it.",
    description:
      "The front page is seven pinned chapters driven by Lenis and GSAP ScrollTrigger, with one WebGL canvas behind them: a textured Earth that turns and zooms to Canada and then shrinks into a galaxy of about a million points, an N-body simulation with a glowing sun, and the apps themselves running live in the last chapter, all in one field of stars. Everything is prerendered to HTML, the 3D is a lazy chunk behind a poster, and reduced motion collapses the whole thing to a plain page.",
    year: "2026",
    status: "Live",
    href: "https://github.com/Noxxider/personal-website",
    repo: "https://github.com/Noxxider/personal-website",
    stack: ["Next.js", "React Three Fiber", "GSAP"],
    image: {
      src: "/work/site.png",
      width: 1152,
      height: 720,
      alt: "The front page of this site: the Earth beside the name",
    },
  },
  {
    slug: "weighttracker",
    title: "Bodyweight Tracker",
    blurb:
      "Paste a run of weigh-ins and get a trend line plus the statistics that actually matter.",
    description:
      "A single-screen tool for looking at bodyweight over time. Paste or type a sequence of weigh-ins, pick the date you started, and it draws the trend and reports the numbers people usually want: average, net change, range, and the average daily drift. The chart is hand-drawn SVG rather than a charting library, so the page stays small. Nothing is uploaded: every calculation runs in the browser and the data disappears when you close the tab.",
    year: "2024",
    status: "Archived",
    href: "/weighttracker",
    repo: "https://github.com/Noxxider/bodyweight-tracker-app",
    stack: ["Next.js", "TypeScript", "No-dependency SVG chart"],
    hidden: true,
  },
  {
    slug: "tapbpm",
    title: "Tap BPM",
    blurb:
      "Tap along to a song or a pulse and read beats per minute off a rolling window.",
    description:
      "Tap the pad in time with whatever you are listening to, or in time with a pulse, and it averages the intervals between your last eight taps to produce a beats per minute reading. It resets itself if you stop for two seconds, so you can start over without touching anything. Built to be usable one-handed on a phone, which is the only place I ever actually need it.",
    year: "2024",
    status: "Archived",
    href: "/tapbpm",
    repo: "https://github.com/Noxxider/tap-bpm",
    stack: ["Next.js", "TypeScript", "Keyboard and touch input"],
    hidden: true,
  },
];

export const listedProjects = projects.filter((p) => !p.hidden);

export type Role = {
  title: string;
  organisation: string;
  period: string;
  summary: string;
  current?: boolean;
};

export const roles: Role[] = [
  {
    title: "Clinical Informatics Analyst",
    organisation: "Interior Health Authority",
    period: "2024 to present",
    current: true,
    summary:
      "I maintain and extend the scheduling systems used to book patient appointments across a health region serving roughly a million people. The work sits between software and operations: configuration, debugging, release testing, and direct support for the clinical staff who depend on it every day.",
  },
  {
    title: "Web Developer",
    organisation: "InstaTix",
    period: "2023 to 2024",
    summary:
      "Built and maintained the marketing site for a white label ticketing platform, along with server administration and the continuous integration pipeline that deployed it.",
  },
  {
    title: "Software Developer, freelance",
    organisation: "ParkBench",
    period: "2023",
    summary:
      "Designed and built a location based social analytics tool with the leadership team, then trained the people who used it day to day.",
  },
  {
    title: "Software Developer",
    organisation: "Rangouts",
    period: "2020 to 2023",
    summary:
      "Led design and development of an event discovery platform with a live map, an activity feed and ticketing, running on AWS with a SQL backend. No longer operating.",
  },
  {
    title: "Software Developer, intern",
    organisation: "Maybank Indonesia",
    period: "2020",
    summary:
      "Built an internal news feature for an employee app and supported the C# and .NET API endpoints behind it.",
  },
];

export const capabilities = [
  {
    group: "Languages",
    items: ["TypeScript", "JavaScript", "Python", "Java", "C#", "SQL"],
  },
  {
    group: "Interface",
    items: ["React", "Next.js", "Vue", "Tailwind CSS", "Three.js", "Accessibility"],
  },
  {
    group: "Services and data",
    items: ["Node.js", ".NET", "PostgreSQL", "MySQL", "MongoDB", "REST APIs"],
  },
  {
    group: "Platform and practice",
    items: ["AWS", "Azure", "Vercel", "Docker", "CI pipelines", "End to end testing"],
  },
] as const;

export const education = [
  {
    title: "BSc, Physics",
    organisation: "University of British Columbia",
    period: "2019 to 2023",
  },
  {
    title: "JavaScript Algorithms and Data Structures",
    organisation: "freeCodeCamp",
    period: "2023",
  },
] as const;
