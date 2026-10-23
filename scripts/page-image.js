/*
 * page-image.js — the content images of a page, for og:image, JSON-LD and the sitemap.
 *
 * A page with a real <img> gets its own 1200x630 share card, og-<page>.png
 * (rendered from that image by scripts/build-page-og.js and committed). A page
 * with no <img>, or no rendered card yet, keeps the site-wide og-card.png.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const attr = (tag, name) => { const m = tag.match(new RegExp('\\s' + name + '="([^"]*)"')); return m ? m[1] : ''; };

// ponytail: regex, not a parser — fine while <img> alt text holds no ">"; check-images.js fails the build on a tag it cannot read.
function pageImages(html) {
  return (html.match(/<img\b[^>]*>/g) || []).map((t) => ({ src: attr(t, 'src'), alt: attr(t, 'alt') }));
}

// First content image decides the card; returns null when the page keeps the site card.
function pageCard(file, html) {
  const first = pageImages(html)[0];
  const card = 'og-' + path.basename(file, '.html') + '.png';
  if (!first || !fs.existsSync(path.join(ROOT, card))) return null;
  return { file: card, alt: first.alt };
}

module.exports = { pageImages, pageCard };
