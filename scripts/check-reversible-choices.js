#!/usr/bin/env node
/*
 * check-reversible-choices.js — a student must be able to take back a choice
 * before pressing Check.
 *
 * The click-to-order widget on the Abitur text-analysis (Ex 4) and
 * argumentative-writing (Ex 1) pages greyed a card out with
 * `.order-item.used{pointer-events:none}` once clicked and had no way to empty
 * a slot, so one wrong click was locked in until Check. Fixed 2026-10-16 by
 * adding removeFromOrder(): clicking a filled slot sends its card back.
 *
 * Fails the build when a root page
 *   - defines addToOrder() but no removeFromOrder() wired to a click, or
 *   - gives a pick-state class (.used/.placed/.taken/.picked/.chosen)
 *     pointer-events:none without defining a remove/undo/unplace handler.
 * Locking AFTER Check (.locked, .matched, disabled selects) is intended and
 * not flagged.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const pages = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html'));

const PICK_LOCK = /\.(?:used|placed|taken|picked|chosen)\s*\{[^}]*pointer-events\s*:\s*none/;
const UNDO_FN = /function\s+(?:remove|undo|unplace|unpick|return)\w*\s*\(/;

const errors = [];
for (const p of pages) {
  const html = fs.readFileSync(path.join(ROOT, p), 'utf8');
  if (/function\s+addToOrder\s*\(/.test(html)) {
    if (!/function\s+removeFromOrder\s*\(/.test(html) || !/onclick\s*=\s*\(\)\s*=>\s*removeFromOrder\(/.test(html)) {
      errors.push(p + ': addToOrder() with no removeFromOrder() on the slots — a placed card cannot be taken back');
    }
  }
  if (PICK_LOCK.test(html) && !UNDO_FN.test(html)) {
    errors.push(p + ': a picked item is made unclickable (pointer-events:none) and nothing can undo the pick');
  }
}

if (errors.length) {
  console.error('check-reversible-choices: ' + errors.length + ' problem(s), a choice locked before Check:');
  errors.forEach((e) => console.error('  ' + e));
  process.exit(1);
}
console.log('check-reversible-choices: ' + pages.length + ' pages OK');
