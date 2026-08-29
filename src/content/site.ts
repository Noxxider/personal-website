/**
 * Single source of truth for site-wide identity, navigation and metadata.
 * Nothing here is secret: it is all already public on LinkedIn or GitHub.
 */

export const site = {
  name: "Ravino Juwono",
  shortName: "Vino",
  role: "Clinical Informatics Analyst",
  employer: "Interior Health Authority",
  location: "Kelowna, British Columbia",
  url: "https://www.ravinojuwono.com",
  /** Public GA4 measurement id, carried over from the previous site. */
  gaMeasurementId: "G-1NQ0WY7B97",
  tagline:
    "Software developer working in clinical informatics, building fast and accessible things for the web.",
  socials: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/ravinojuwono" },
    { label: "GitHub", href: "https://github.com/Noxxider" },
  ],
} as const;

export const nav = [
  { label: "Work", href: "/work" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;
