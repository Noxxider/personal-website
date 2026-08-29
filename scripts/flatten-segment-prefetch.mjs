/**
 * Post-build fix for `output: "export"` in Next 16.
 *
 * The router asks for per-route segment prefetch payloads at flat paths such as
 *   /work/__next.work.__PAGE__.txt
 * but the exporter writes them as nested directories:
 *   out/work/__next.work/__PAGE__.txt
 *
 * Every prefetch therefore 404s on a plain static host, and navigation falls
 * back to a full document load. This copies each nested payload to the flat
 * name the router actually requests. It is a no-op once the exporter emits
 * the flat files itself, so it is safe to keep across upgrades.
 */
import { readdir, copyFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, sep } from "node:path";

const OUT = join(process.cwd(), "out");

if (!existsSync(OUT)) {
  console.error("flatten-segment-prefetch: no out/ directory, skipping.");
  process.exit(0);
}

/** Every file under `dir`, as paths relative to `dir`. */
async function filesUnder(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const out = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      for (const nested of await filesUnder(full)) out.push(join(entry.name, nested));
    } else {
      out.push(entry.name);
    }
  }
  return out;
}

let copied = 0;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (!entry.isDirectory()) continue;

    if (entry.name.startsWith("__next.")) {
      for (const rel of await filesUnder(full)) {
        const flat = join(dir, `${entry.name}.${rel.split(sep).join(".")}`);
        if (existsSync(flat)) continue;
        await copyFile(join(full, rel), flat);
        copied += 1;
      }
      continue;
    }

    if (entry.name === "_next") continue;
    await walk(full);
  }
}

await walk(OUT);

const total = (await stat(OUT)).isDirectory() ? copied : 0;
console.log(
  total > 0
    ? `flatten-segment-prefetch: wrote ${total} flat segment payload${total === 1 ? "" : "s"}.`
    : "flatten-segment-prefetch: nothing to do.",
);
