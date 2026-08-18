#!/usr/bin/env node
/**
 * build-og-card.js — render scripts/og-card.html to og-card.png (1200x630).
 *
 * The social preview image has to be a raster at roughly 1.91:1; the site icon
 * is square and far too small, so a link shared into WhatsApp or a parents'
 * group used to show a blurry crop of the favicon. This renders a real branded
 * card with text, using the Chromium that Playwright already provides.
 *
 * Playwright is NOT a dependency of this repo (there is no build system here),
 * so this script is run rarely and its output is committed. If Playwright is
 * missing, open scripts/og-card.html in a browser at 1200x630 and screenshot it
 * to og-card.png by hand — the file is the source of truth either way.
 *
 * Run: node scripts/build-og-card.js
 *      (optionally PLAYWRIGHT_DIR=/path/to/node_modules)
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'og-card.png');
const SRC = path.join(__dirname, 'og-card.html');

let chromium;
try {
  const dir = process.env.PLAYWRIGHT_DIR;
  ({ chromium } = require(dir ? path.join(dir, 'playwright') : 'playwright'));
} catch (err) {
  console.error(
    'Playwright is not installed here, so the card cannot be rendered automatically.\n' +
    'Either:  npm i playwright   (then re-run, optionally with PLAYWRIGHT_DIR=...)\n' +
    'Or:      open scripts/og-card.html in a browser sized 1200x630 and save the\n' +
    '         screenshot as og-card.png in the repo root.'
  );
  process.exit(1);
}

(async () => {
  const executablePath = process.env.CHROMIUM_PATH ||
    ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find((p) => fs.existsSync(p));

  const browser = await chromium.launch(executablePath ? { executablePath } : {});
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.goto('file://' + SRC, { waitUntil: 'networkidle' });
  await page.screenshot({ path: OUT });
  await browser.close();

  const { size } = fs.statSync(OUT);
  console.log(`og-card.png written — 1200x630, ${size.toLocaleString('en-GB')} bytes`);
  console.log('Fonts come from the rendering machine, so re-rendering elsewhere may shift the text slightly.');
})();
