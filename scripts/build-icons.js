#!/usr/bin/env node
/**
 * build-icons.js — generate the site icon set from one geometric definition.
 *
 * The repo had no favicon at all, so every page 404'd on /favicon.ico and
 * browsers/phones had nothing to show in tabs, bookmarks or on a home screen.
 * Rather than commit binaries nobody can regenerate, the mark is defined here
 * as maths (rounded square in --blue, gold tick) and rasterised deterministically:
 * re-running this script produces byte-identical files, so icons never churn in git.
 *
 * Outputs (repo root):
 *   icon.svg             vector favicon (what modern browsers prefer)
 *   favicon.ico          32x32, for old browsers and the bare /favicon.ico request
 *   apple-touch-icon.png 180x180, iOS home screen
 *   icon-192.png         web manifest + og:image fallback
 *   icon-512.png         web manifest, splash screen, og:image
 *
 * Run: node scripts/build-icons.js
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT = path.join(__dirname, '..');

const BLUE = [0x1a, 0x3a, 0x5c];
const GOLD = [0xc9, 0xa2, 0x27];

// --- geometry, in a 0..1 unit square -------------------------------------
const RADIUS = 0.22;                       // rounded-square corner radius
const TICK = [[0.28, 0.53], [0.44, 0.69], [0.74, 0.33]];
const TICK_WIDTH = 0.115;                  // stroke width, round caps/joins

function sdRoundedRect(x, y, r) {
  // distance from (x,y) to the edge of the unit square with corner radius r
  const qx = Math.abs(x - 0.5) - (0.5 - r);
  const qy = Math.abs(y - 0.5) - (0.5 - r);
  const ax = Math.max(qx, 0), ay = Math.max(qy, 0);
  return Math.hypot(ax, ay) + Math.min(Math.max(qx, qy), 0) - r;
}

function sdSegment(px, py, a, b) {
  const vx = b[0] - a[0], vy = b[1] - a[1];
  const wx = px - a[0], wy = py - a[1];
  const t = Math.max(0, Math.min(1, (wx * vx + wy * vy) / (vx * vx + vy * vy)));
  return Math.hypot(wx - t * vx, wy - t * vy);
}

function sdTick(x, y) {
  let d = Infinity;
  for (let i = 0; i < TICK.length - 1; i++) {
    d = Math.min(d, sdSegment(x, y, TICK[i], TICK[i + 1]));
  }
  return d - TICK_WIDTH / 2; // round caps and joins fall out of the distance field
}

/** Anti-aliased coverage of a signed distance, in pixels of the target size. */
function coverage(d, size) {
  return Math.max(0, Math.min(1, 0.5 - d * size));
}

function blend(dst, src, a) {
  return Math.round(dst * (1 - a) + src * a);
}

/** Render the mark to raw RGBA. Transparent outside the rounded square. */
function render(size) {
  const px = Buffer.alloc(size * size * 4);
  for (let iy = 0; iy < size; iy++) {
    for (let ix = 0; ix < size; ix++) {
      const x = (ix + 0.5) / size, y = (iy + 0.5) / size;
      const bg = coverage(sdRoundedRect(x, y, RADIUS), size);
      const fg = coverage(sdTick(x, y), size) * bg;
      const o = (iy * size + ix) * 4;
      for (let c = 0; c < 3; c++) px[o + c] = blend(BLUE[c], GOLD[c], fg === 0 ? 0 : fg / Math.max(bg, fg));
      px[o + 3] = Math.round(255 * bg);
    }
  }
  return px;
}

// --- PNG encoding ---------------------------------------------------------
function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = c ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function png(size, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;    // bit depth
  ihdr[9] = 6;    // colour type: RGBA
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0; // filter: none
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/** ICO wrapping a single PNG — every browser that reads .ico reads PNG-in-ICO. */
function ico(size, pngBuf) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // one image
  const entry = Buffer.alloc(16);
  entry[0] = size === 256 ? 0 : size;
  entry[1] = size === 256 ? 0 : size;
  entry.writeUInt16LE(1, 4);  // colour planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(pngBuf.length, 8);
  entry.writeUInt32LE(22, 12); // offset
  return Buffer.concat([header, entry, pngBuf]);
}

// The SVG favicon flips in dark mode: a dark navy square disappears into a dark
// tab strip, so there the square goes light and the tick goes navy. The raster
// icons below cannot do this, which is why the SVG is listed first in the head.
const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" role="img" aria-label="englishonline.training">
  <style>
    .bg { fill: #1a3a5c }
    .tick { stroke: #c9a227 }
    @media (prefers-color-scheme: dark) {
      .bg { fill: #f7f9fc }
      .tick { stroke: #1a3a5c }
    }
  </style>
  <rect class="bg" width="100" height="100" rx="${RADIUS * 100}"/>
  <path class="tick" d="M${TICK.map(p => `${+(p[0] * 100).toFixed(2)} ${+(p[1] * 100).toFixed(2)}`).join(' L')}"
        fill="none" stroke-width="${TICK_WIDTH * 100}"
        stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

const MANIFEST = {
  name: 'EnglishOnline.training — Übungen',
  short_name: 'EOT Übungen',
  description: 'Interaktive Englisch-Übungen für Klasse 7–10, MSA, Abitur, Uni, Business und IT.',
  start_url: './',
  scope: './',
  display: 'standalone',
  lang: 'de',
  background_color: '#f7f9fc',
  theme_color: '#1a3a5c',
  icons: [
    { src: 'icon.svg', type: 'image/svg+xml', sizes: 'any' },
    { src: 'icon-192.png', type: 'image/png', sizes: '192x192' },
    { src: 'icon-512.png', type: 'image/png', sizes: '512x512' },
    { src: 'icon-512.png', type: 'image/png', sizes: '512x512', purpose: 'maskable' },
  ],
};

const written = [];
function write(name, buf) {
  fs.writeFileSync(path.join(ROOT, name), buf);
  written.push(`${name} (${buf.length.toLocaleString('en-GB')} bytes)`);
}

write('icon.svg', Buffer.from(SVG, 'utf8'));
write('favicon.ico', ico(32, png(32, render(32))));
write('apple-touch-icon.png', png(180, render(180)));
write('icon-192.png', png(192, render(192)));
write('icon-512.png', png(512, render(512)));
write('site.webmanifest', Buffer.from(JSON.stringify(MANIFEST, null, 2) + '\n', 'utf8'));

console.log('Icon set written:\n  ' + written.join('\n  '));
