// Builds src/content/globe.json: the land dots and the Canada outline the
// home page globe is drawn from.
//
// Source: Natural Earth 1:110m Admin 0 countries (public domain), fetched
// from the natural-earth-vector repository. The whole file is about 800 kB;
// what ships is a few thousand [lat, lon] pairs at one decimal place.
//
//   node scripts/build-globe.mjs
//
// Land dots are a Fibonacci lattice on the sphere, kept where the point falls
// inside any country polygon, so the density is even from the equator to the
// poles. The outline is Canada's rings as they come, thinned slightly.

import { writeFile } from "node:fs/promises";

const SOURCE =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson";
const SAMPLES = 14000;
const OUT = new URL("../src/content/globe.json", import.meta.url);

const response = await fetch(SOURCE);
if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
const geo = await response.json();

/** Every ring of every polygon, as [lon, lat] arrays, plus a bounding box. */
const rings = [];
let canada = null;
for (const feature of geo.features) {
  const name = feature.properties.ADMIN ?? feature.properties.NAME;
  const geometry = feature.geometry;
  const polygons =
    geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  for (const polygon of polygons) {
    for (const ring of polygon) {
      let minLon = 180, maxLon = -180, minLat = 90, maxLat = -90;
      for (const [lon, lat] of ring) {
        if (lon < minLon) minLon = lon;
        if (lon > maxLon) maxLon = lon;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
      }
      rings.push({ ring, minLon, maxLon, minLat, maxLat, outer: ring === polygon[0] });
    }
  }
  if (name === "Canada") canada = polygons;
}
if (!canada) throw new Error("Canada not found in the source file");

function inRing(lon, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const crosses =
      yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (crosses) inside = !inside;
  }
  return inside;
}

function onLand(lon, lat) {
  // Outer rings add, holes (later rings of the same polygon) subtract; at 110m
  // holes are rare enough that counting crossings across all rings is right.
  let hits = 0;
  for (const r of rings) {
    if (lon < r.minLon || lon > r.maxLon || lat < r.minLat || lat > r.maxLat) continue;
    if (inRing(lon, lat, r.ring)) hits++;
  }
  return hits % 2 === 1;
}

const land = [];
const golden = Math.PI * (3 - Math.sqrt(5));
for (let i = 0; i < SAMPLES; i++) {
  const y = 1 - (i / (SAMPLES - 1)) * 2;
  const theta = golden * i;
  const lat = (Math.asin(y) * 180) / Math.PI;
  let lon = ((theta * 180) / Math.PI) % 360;
  if (lon > 180) lon -= 360;
  if (lon < -180) lon += 360;
  if (lat < -84) continue; // No dots on the Antarctic underside nobody sees.
  if (onLand(lon, lat)) land.push(Math.round(lat * 10) / 10, Math.round(lon * 10) / 10);
}

/** Canada's rings, every second vertex on the long ones, [lat, lon] pairs. */
const outline = [];
for (const polygon of canada) {
  const ring = polygon[0];
  const step = ring.length > 200 ? 2 : 1;
  const flat = [];
  for (let i = 0; i < ring.length; i += step) {
    const [lon, lat] = ring[i];
    flat.push(Math.round(lat * 10) / 10, Math.round(lon * 10) / 10);
  }
  if (flat.length >= 8) outline.push(flat);
}

const json = JSON.stringify({ land, outline });
await writeFile(OUT, json);
console.log(
  `land dots: ${land.length / 2}, outline rings: ${outline.length}, ${(json.length / 1024).toFixed(1)} kB`,
);
