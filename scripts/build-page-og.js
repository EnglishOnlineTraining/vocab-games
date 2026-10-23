#!/usr/bin/env node
/**
 * build-page-og.js — render og-<page>.png (1200x630) from each page's first content image.
 *
 * Manual like build-og-card.js: output is committed, Playwright is not a build dependency.
 * The image is cropped to fill the card (object-fit: cover, 5% overscan to trim white scan margins); build-head.js picks the card
 * up automatically once the file exists.
 * Run: node scripts/build-page-og.js
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { pageImages } = require('./page-image');

const ROOT = path.join(__dirname, '..');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  for (const f of fs.readdirSync(ROOT).filter((n) => n.endsWith('.html'))) {
    const first = pageImages(fs.readFileSync(path.join(ROOT, f), 'utf8'))[0];
    if (!first) continue;
    // Written beside the image: a file:// image cannot load into an about:blank page.
    const tmp = path.join(ROOT, '.og-tmp.html');
    fs.writeFileSync(tmp, `<body style="margin:0;overflow:hidden"><img src="${first.src}" style="width:1275px;height:670px;margin-left:-15px;object-fit:cover;object-position:top left;display:block">`);
    await page.goto('file://' + tmp);
    await page.waitForFunction(() => document.images[0].complete);
    fs.unlinkSync(tmp);
    const out = 'og-' + path.basename(f, '.html') + '.png';
    await page.screenshot({ path: path.join(ROOT, out) });
    console.log(out + ' <- ' + first.src);
  }
  await browser.close();
})();
