import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Public pages are still prerendered to static HTML at build time. The app is
  // no longer a pure `output: "export"` build because the private area needs
  // middleware, which requires a runtime.
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false,
  typedRoutes: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        // Belt and braces: the private area must never be indexed, even if a
        // crawler somehow gets past the password.
        source: "/private/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
