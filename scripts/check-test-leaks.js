#!/usr/bin/env node
/* ============================================================
   check-test-leaks.js — a vocabulary test must never print an answer.

   The vocab tests ask a student to PRODUCE a word in Section B (type it
   from its meaning) and Section C (use it in a sentence). If that word is
   also printed in the page's own furniture — the heading, a section
   instruction, a button — the answer is on screen while the question is
   asked.

   This is not hypothetical. Both live pages had one:
     9c  the bank contains "term", and Section B said
         "Type the term that matches each definition"
     9g  the bank contains "G'day", and the page heading reads
         "G'day Australia! — Unit 1 Vocabulary Test"

   Each page declares `const UI_WORDS = [...]` naming the bank words that do
   appear in its furniture; buildQuestions() keeps those out of Sections B
   and C (Section A is exempt — it offers the answer in a dropdown anyway).
   This checker fails the build when a bank word appears in the page text
   and is NOT declared, which is the case nobody would notice by reading.

   The study word list on the register screen is excluded from the scan: it
   lists every word on purpose, before the timer starts.

   Run: node scripts/check-test-leaks.js       (exit 1 on an undeclared leak)
============================================================ */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const pages = fs.readdirSync(ROOT)
  .filter(f => /-vocab-test\.html$/.test(f))
  .filter(f => /const VOCAB_BANK/.test(fs.readFileSync(path.join(ROOT, f), 'utf8')));

if (!pages.length) {
  console.log('check-test-leaks: no vocabulary test page found — nothing to check.');
  process.exit(0);
}

function uiText(html) {
  return html
    // the bank itself
    .replace(/const VOCAB_BANK = \[[\s\S]*?\];/, ' ')
    // the study list on the register screen — lists every word deliberately
    .replace(/<div class="wl-card">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, ' ')
    .replace(/<div class="wl-box">[\s\S]*?<\/div>\s*<\/div>/, ' ')
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

let bad = 0;
for (const f of pages) {
  const html = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const bank = JSON.parse(html.match(/const VOCAB_BANK = (\[[\s\S]*?\]);/)[1]);
  const declared = new Set(
    JSON.parse((html.match(/const UI_WORDS\s*=\s*(\[[^\]]*\]);/) || [, '[]'])[1]));
  const text = uiText(html);

  const found = bank.map(x => x.t).filter(t => {
    const w = t.toLowerCase().replace(/^to (be )?/, '');
    if (w.length < 4) return false;               // too short to be a real signal
    const re = new RegExp('\\b' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '\\s+') + '\\b');
    return re.test(text);
  });
  const undeclared = found.filter(t => !declared.has(t));
  const stale = [...declared].filter(t => !found.includes(t));

  if (undeclared.length) {
    bad++;
    console.error(`✗ ${f}`);
    undeclared.forEach(t => console.error(`    "${t}" is printed in the page text but not in UI_WORDS`));
    console.error(`    Either reword the page so it does not say it, or add it to UI_WORDS`);
    console.error(`    so Sections B and C never draw it.`);
  } else {
    console.log(`✓ ${f} — ${bank.length} bank words, ${found.length} in page text, all declared`
      + (stale.length ? ` (stale UI_WORDS entries, safe to remove: ${stale.join(', ')})` : ''));
  }
}

if (bad) {
  console.error(`\ncheck-test-leaks: ${bad} page(s) print an answer they also ask for.`);
  process.exit(1);
}
console.log(`check-test-leaks: ${pages.length} test page(s) clean.`);
