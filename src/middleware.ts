import { NextResponse, type NextRequest } from "next/server";

/**
 * HTTP Basic Auth in front of /private.
 *
 * Credentials come from PRIVATE_USER and PRIVATE_PASSWORD in the Vercel
 * project's environment. They are only ever read here, on the server, so they
 * never reach the browser bundle. If either is missing the whole area is
 * refused rather than left open.
 */
const REALM = 'Basic realm="Private", charset="UTF-8"';

function unauthorized() {
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": REALM,
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

/** Length-independent comparison, so a wrong guess leaks no timing signal. */
function safeEqual(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const left = encoder.encode(a);
  const right = encoder.encode(b);
  let diff = left.length ^ right.length;
  const max = Math.max(left.length, right.length);
  for (let i = 0; i < max; i++) {
    diff |= (left[i] ?? 0) ^ (right[i] ?? 0);
  }
  return diff === 0;
}

export function middleware(request: NextRequest) {
  const user = process.env["PRIVATE_USER"];
  const password = process.env["PRIVATE_PASSWORD"];

  // Never fail open. An unconfigured environment locks the area rather than
  // publishing it.
  if (!user || !password) return unauthorized();

  const header = request.headers.get("authorization");
  if (!header?.startsWith("Basic ")) return unauthorized();

  let decoded: string;
  try {
    decoded = atob(header.slice(6));
  } catch {
    return unauthorized();
  }

  const separator = decoded.indexOf(":");
  if (separator === -1) return unauthorized();

  const okUser = safeEqual(decoded.slice(0, separator), user);
  const okPassword = safeEqual(decoded.slice(separator + 1), password);
  if (!okUser || !okPassword) return unauthorized();

  const response = NextResponse.next();
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export const config = {
  matcher: ["/private", "/private/:path*"],
};
