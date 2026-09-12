"use server";

import { headers } from "next/headers";
import { getSql } from "@/lib/db";
import countries from "@/content/countries.json";

export type Hello = { country: string; count: number };

const CODES = new Set(Object.keys(countries));

async function ensureTable(sql: NonNullable<ReturnType<typeof getSql>>) {
  await sql`CREATE TABLE IF NOT EXISTS hellos (
    country text PRIMARY KEY,
    count integer NOT NULL DEFAULT 0,
    updated timestamptz NOT NULL DEFAULT now()
  )`;
}

/** Every country that has said hello, with its count. Empty without a database. */
export async function getHellos(): Promise<{ hellos: Hello[]; connected: boolean }> {
  const sql = getSql();
  if (!sql) return { hellos: [], connected: false };
  try {
    await ensureTable(sql);
    const rows = (await sql`SELECT country, count FROM hellos ORDER BY count DESC`) as Hello[];
    return { hellos: rows, connected: true };
  } catch (error) {
    console.error("Could not read hellos.", error);
    return { hellos: [], connected: false };
  }
}

/**
 * Records one hello for the visitor's country. Only the country code from the
 * edge is read; no address, no user agent, nothing else is stored. Returns
 * the country so the page can light it up even before the next read.
 */
export async function sayHello(): Promise<{ country: string | null; connected: boolean }> {
  const h = await headers();
  const raw = (h.get("x-vercel-ip-country") ?? "").toUpperCase();
  const country = CODES.has(raw) ? raw : null;
  const sql = getSql();
  if (!sql || !country) return { country, connected: Boolean(sql) };
  try {
    await ensureTable(sql);
    await sql`INSERT INTO hellos (country, count) VALUES (${country}, 1)
      ON CONFLICT (country) DO UPDATE SET count = hellos.count + 1, updated = now()`;
    return { country, connected: true };
  } catch (error) {
    console.error("Could not record hello.", error);
    return { country, connected: false };
  }
}
