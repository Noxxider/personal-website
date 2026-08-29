import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const alt = `${site.name}, ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-static";

/**
 * Social card. Generated at build time, so it ships as a static PNG and there
 * is no image service to keep running.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#FBFAF8",
          color: "#16161A",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 22,
            letterSpacing: 3,
            color: "#928D85",
          }}
        >
          <div
            style={{
              display: "flex",
              width: 12,
              height: 12,
              borderRadius: 12,
              background: "#A6432B",
            }}
          />
          <div style={{ display: "flex" }}>KELOWNA, BRITISH COLUMBIA</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 108,
              lineHeight: 1,
              letterSpacing: -3,
              fontWeight: 600,
            }}
          >
            {site.name}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontSize: 34,
              lineHeight: 1.35,
              color: "#66625C",
              maxWidth: 940,
            }}
          >
            {`${site.role} at ${site.employer}. Building fast, accessible software for the web.`}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 24,
            color: "#928D85",
            borderTop: "1px solid #E7E3DB",
            paddingTop: 28,
          }}
        >
          <div style={{ display: "flex" }}>ravinojuwono.com</div>
          <div style={{ display: "flex" }}>
            TypeScript · Next.js · Vue · .NET
          </div>
        </div>
      </div>
    ),
    size,
  );
}
