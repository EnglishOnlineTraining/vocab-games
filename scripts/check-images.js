#!/usr/bin/env node
/* check-images.js — every <img> on every page needs alt, width and height
   (width/height stop layout shift; alt is the accessibility and image-search text).
   Run: node scripts/check-images.js   (exit 1 on a bad tag) */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const files = [].concat(
  fs.readdirSync(ROOT).filter((f) => f.endsWith('.html')),
  fs.existsSync(path.join(ROOT, 'themen')) ? fs.readdirSync(path.join(ROOT, 'themen')).filter((f) => f.endsWith('.html')).map((f) => 'themen/' + f) : []
);

const bad = [];
let total = 0;
for (const f of files) {
  for (const tag of fs.readFileSync(path.join(ROOT, f), 'utf8').match(/<img\b[^>]*>/g) || []) {
    total++;
    const missing = ['alt', 'width', 'height'].filter((a) => !new RegExp('\\s' + a + '="[^"]+"').test(tag));
    if (missing.length) bad.push(f + ': <img src="' + ((tag.match(/src="([^"]*)"/) || [])[1] || '?') + '"> missing ' + missing.join(', '));
  }
}
if (bad.length) { bad.forEach((b) => console.error('✗ ' + b)); process.exit(1); }
console.log('check-images: ' + total + ' <img> tags across ' + files.length + ' pages, all have alt, width and height');
