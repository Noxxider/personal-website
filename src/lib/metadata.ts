import type { Metadata } from "next";
import { site } from "@/content/site";

/**
 * Open Graph and Twitter tags are not merged field by field across segments:
 * a page that sets `openGraph` replaces the layout's wholesale. This builds a
 * complete card for each page so nothing silently inherits the home page copy.
 */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  /** Route path with a trailing slash, for example "/work/". */
  path: string;
}): Metadata {
  const fullTitle = path === "/" ? title : `${title} · ${site.name}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: "en_CA",
      title: fullTitle,
      description,
      url: path,
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
      title: fullTitle,
      description,
      images: ["/og.png"],
    },
  };
}
