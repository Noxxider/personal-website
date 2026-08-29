export type Project = {
  slug: string;
  title: string;
  /** Short line used on cards and in the work index. */
  blurb: string;
  /** Longer description used on the project page itself. */
  description: string;
  year: string;
  status: "Live" | "Archived";
  href: string;
  repo?: string;
  stack: string[];
};

/**
 * Projects that are publicly linkable and that I can point at without
 * caveats. Each live entry is a working tool hosted on this site.
 */
export const projects: Project[] = [
  {
    slug: "weighttracker",
    title: "Bodyweight Tracker",
    blurb:
      "Paste a run of weigh-ins and get a trend line plus the statistics that actually matter.",
    description:
      "A single-screen tool for looking at bodyweight over time. Paste or type a sequence of weigh-ins, pick the date you started, and it draws the trend and reports the numbers people usually want: average, net change, range, and the average daily drift. The chart is hand-drawn SVG rather than a charting library, so the page stays small. Nothing is uploaded: every calculation runs in the browser and the data disappears when you close the tab.",
    year: "2024",
    status: "Live",
    href: "/weighttracker",
    repo: "https://github.com/Noxxider/bodyweight-tracker-app",
    stack: ["Next.js", "TypeScript", "SVG chart", "Client-side only"],
  },
  {
    slug: "tapbpm",
    title: "Tap BPM",
    blurb:
      "Tap along to a song or a pulse and read beats per minute off a rolling window.",
    description:
      "Tap the pad in time with whatever you are listening to, or in time with a pulse, and it averages the intervals between your last eight taps to produce a beats per minute reading. It resets itself if you stop for two seconds, so you can start over without touching anything. Built to be usable one-handed on a phone, which is the only place I ever actually need it.",
    year: "2024",
    status: "Live",
    href: "/tapbpm",
    repo: "https://github.com/Noxxider/tap-bpm",
    stack: ["Next.js", "TypeScript", "Keyboard and touch input"],
  },
  {
    slug: "site",
    title: "This site",
    blurb:
      "Statically exported Next.js, no client-side data fetching, no component library styling out of the box.",
    description:
      "Rebuilt from a 2023 Quasar single page app into a statically exported Next.js site. Every route is prerendered to HTML at build time, so there is no server runtime and no loading spinner on navigation. The type scale, colour tokens and layout primitives are hand-built on top of Tailwind, with a small number of shadcn/ui primitives used where accessibility behaviour is worth not reinventing.",
    year: "2026",
    status: "Live",
    href: "https://github.com/Noxxider/personal-website",
    repo: "https://github.com/Noxxider/personal-website",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui", "Netlify"],
  },
];

export const liveProjects = projects.filter((p) => p.href.startsWith("/"));

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
      "I maintain and extend the Community Wide Scheduling module in Meditech, the system used to book patient appointments across a health region serving roughly a million people. The work sits between software and operations: configuration, debugging, release testing, and direct support for the clinical staff who depend on it every day.",
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
    items: [
      "React",
      "Next.js",
      "Vue",
      "Tailwind CSS",
      "shadcn/ui",
      "Accessibility",
    ],
  },
  {
    group: "Services and data",
    items: [
      "Node.js",
      ".NET",
      "PostgreSQL",
      "MySQL",
      "MongoDB",
      "REST APIs",
    ],
  },
  {
    group: "Platform and practice",
    items: [
      "AWS",
      "Azure",
      "Docker",
      "CI pipelines",
      "End to end testing",
      "AI assisted development",
    ],
  },
] as const;

export const education = [
  {
    title: "BSc, Physics",
    organisation: "University of British Columbia Okanagan",
    period: "2019 to 2023",
  },
  {
    title: "JavaScript Algorithms and Data Structures",
    organisation: "freeCodeCamp",
    period: "2023",
  },
] as const;
