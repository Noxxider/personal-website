import "server-only";
import { neon } from "@neondatabase/serverless";

/**
 * The one database on the site, a Neon Postgres reached over HTTP. Present
 * only when the Neon integration has been added to the Vercel project, which
 * sets DATABASE_URL. Everything that uses it must work without it.
 */
export function getSql() {
  const url = process.env["DATABASE_URL"];
  if (!url) return null;
  return neon(url);
}

export const hasDatabase = () => Boolean(process.env["DATABASE_URL"]);
