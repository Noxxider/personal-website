import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ScrollProvider } from "@/components/scroll-provider";
import { site } from "@/content/site";
import "./globals.css";

// All three are variable fonts and self-hosted by next/font, so the page makes
// no third-party font request and ships one file per face, not one per weight.
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

// Optical size and the "WONK" axis are the two Fraunces axes the display
// styles use; the rest are left out to keep the file small.
const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz", "WONK"],
  variable: "--font-fraunces",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0a0d12",
  colorScheme: "dark",
};

const description =
  "Ravino Juwono is a clinical informatics analyst. He keeps hospital scheduling software running for a health region of about a million people, and builds fast, accessible tools for the web.";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name}, software developer`,
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
    "Next.js",
    "TypeScript",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_CA",
    title: `${site.name}, software developer`,
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
    title: `${site.name}, software developer`,
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
  jobTitle: site.role,
  worksFor: { "@type": "Organization", name: site.employer },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "University of British Columbia",
  },
  sameAs: site.socials.map((s) => s.href),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable} ${fraunces.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </head>
      <body className="flex min-h-dvh flex-col antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-5 focus:py-2.5 focus:text-sm focus:text-ground"
        >
          Skip to content
        </a>
        <ScrollProvider>
          <SiteHeader />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </ScrollProvider>

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
