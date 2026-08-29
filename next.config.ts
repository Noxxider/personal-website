import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The site is fully static: no server runtime, no serverless functions.
  // Netlify publishes the `out/` directory directly.
  output: "export",
  trailingSlash: true,
  images: {
    // Required for `output: "export"`. All imagery is local and pre-sized.
    unoptimized: true,
  },
  reactStrictMode: true,
  poweredByHeader: false,
  typedRoutes: true,
};

export default nextConfig;
