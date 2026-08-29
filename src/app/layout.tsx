import type { Metadata } from "next";
import Script from "next/script";
import { Instrument_Serif, Inter_Tight } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { site } from "@/content/site";
import "./globals.css";

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter-tight",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const description =
  "Ravino Juwono is a clinical informatics analyst in Kelowna, British Columbia. He keeps hospital scheduling software running for a health region of about a million people, and builds fast, accessible tools for the web.";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name}, software developer in Kelowna`,
    template: `%s · ${site.name}`,
  },
  description,
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  keywords: [
    "Ravino Juwono",
    "clinical informatics",
    "software developer",
    "Kelowna",
    "Next.js",
    "TypeScript",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_CA",
    title: `${site.name}, software developer in Kelowna`,
    description,
    url: "/",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: `${site.name}, ${site.role}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name}, software developer in Kelowna`,
    description,
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  alternateName: site.shortName,
  url: site.url,
  email: `mailto:${site.email}`,
  jobTitle: site.role,
  worksFor: { "@type": "Organization", name: site.employer },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Kelowna",
    addressRegion: "BC",
    addressCountry: "CA",
  },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "University of British Columbia Okanagan",
  },
  sameAs: site.socials.map((s) => s.href),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${interTight.variable} ${instrumentSerif.variable}`}>
      <head>
        <noscript>
          {/* Scroll reveals default to hidden; without JavaScript they must not stay that way. */}
          <style>{`.reveal{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </head>
      <body className="flex min-h-dvh flex-col antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-5 focus:py-2.5 focus:text-sm focus:text-paper"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />

        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${site.gaMeasurementId}`}
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${site.gaMeasurementId}');`}
        </Script>
      </body>
    </html>
  );
}
