import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export const dynamic = "force-static";

// Trailing slashes to match `trailingSlash: true` and the canonical tags.
const routes = ["/", "/work/", "/about/", "/contact/", "/weighttracker/", "/tapbpm/"];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return routes.map((route) => ({
    url: `${site.url}${route}`,
    lastModified,
    changeFrequency: route === "/" ? "monthly" : "yearly",
    priority: route === "/" ? 1 : route === "/work/" ? 0.8 : 0.6,
  }));
}
