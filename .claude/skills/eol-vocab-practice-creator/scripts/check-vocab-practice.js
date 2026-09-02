#!/usr/bin/env node
/*
 * check-vocab-practice.js — wiring + coverage check for a vocabulary
 * practice page built with the eol-vocab-practice-creator skill.
 *
 *   node .claude/skills/eol-vocab-practice-creator/scripts/check-vocab-practice.js <file.html>
 *
 * The promise a practice page makes to a student is "revise here and
 * nothing in the test will be new". That promise is only kept if every
 * word on the list is actually tested — twice, once for meaning and once
 * in a sentence — and if every answer key really matches an option the
 * page offers. Both are easy to get subtly wrong by hand across 25+ words
 * and impossible to spot by reading, so they are checked here instead.
 *
 * Exits 0 when the page is sound, 1 with a list of problems when not.
 */
'use strict';

const fs = require('fs');

const file = process.argv[2];
if (!file) {
  console.error('usage: check-vocab-practice.js <file.html>');
  process.exit(2);
}
const html = fs.readFileSync(file, 'utf8');
const problems = [];
const fail = m => problems.push(m);

/* ── Pull a top-level `var NAME = <literal>;` out of the page ──
   Scans for the bracket that closes the literal while skipping over
   string contents, so an apostrophe or a bracket inside a definition
   cannot end the match early the way a lazy regex would. */
function literal(name) {
  const at = html.indexOf('var ' + name);
  if (at === -1) return null;
  const open = html.search(new RegExp('var\\s+' + name + '\\s*=\\s*[\\[{]'));
  if (open === -1) return null;
  let i = html.indexOf('=', open) + 1;
  while (/\s/.test(html[i])) i++;
  const start = i;
  const pairs = { '[': ']', '{': '}' };
  const close = pairs[html[i]];
  let depth = 0, quote = null;
  for (; i < html.length; i++) {
    const c = html[i];
    if (quote) {
      if (c === '\\') i++;
      else if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'") { quote = c; continue; }
    if (c === '[' || c === '{') depth++;
    else if (c === ']' || c === '}') {
      depth--;
      if (depth === 0) {
        const src = html.slice(start, i + 1);
        if (html[i] !== close) return null;
        try { return new Function('return ' + src)(); }
        catch (e) { fail(`${name} does not parse as JavaScript: ${e.message}`); return null; }
      }
    }
  }
  return null;
}

const VOCAB  = literal('VOCAB');
const FOCUS  = literal('FOCUS_LABELS');
const B_ANS  = literal('B_ANSWERS');
const C_ANS  = literal('C_ANSWERS');

if (!VOCAB) fail('no `var VOCAB = [...]` found — the word list is the page\'s source of truth');
if (!FOCUS) fail('no `var FOCUS_LABELS = {...}` found — without it the end review cannot name the weak words');
if (!B_ANS) fail('no `var B_ANSWERS = {...}` found (multiple-choice answer key)');
if (!C_ANS) fail('no `var C_ANSWERS = {...}` found (cloze answer key)');

/* ── The word list itself ── */
const words = [];
if (VOCAB) {
  const seen = new Set();
  VOCAB.forEach((e, i) => {
    if (!e || !e.w)   return fail(`VOCAB[${i}] has no \`w\` (the word)`);
    if (!e.def)       fail(`VOCAB[${i}] "${e.w}" has no \`def\` (English definition)`);
    if (seen.has(e.w)) fail(`"${e.w}" appears twice in VOCAB`);
    seen.add(e.w);
    words.push(e.w);

    /* A definition that reuses the headword tells a student nothing they
       could not already see, so it is a real defect rather than a nit. */
    const head = String(e.w).replace(/^(to|the|a|an)\s+/i, '').toLowerCase();
    if (e.def && head.length > 3 && String(e.def).toLowerCase().includes(head)) {
      fail(`"${e.w}": the definition repeats the word itself — define it with simpler words instead`);
    }
  });
}

/* ── Rule 0: English only, whatever language the source list was in ──
   Klett word lists arrive as English–German, and a German gloss is the
   easiest thing in the world to paste through by accident. */
const GERMAN_HINT = /[äöüßÄÖÜ]|\b(der|die|das|und|oder|nicht|mit|ein|eine|einen|sich|für|von|zu|ist|sind)\b/;
function englishOnly(where, text) {
  if (text && GERMAN_HINT.test(String(text))) {
    fail(`${where} looks like it still contains German: "${text}" — practice pages are English throughout`);
  }
}
if (VOCAB) VOCAB.forEach(e => { englishOnly(`VOCAB "${e && e.w}" definition`, e && e.def); englishOnly(`VOCAB entry`, e && e.w); });
if (FOCUS) Object.keys(FOCUS).forEach(k => englishOnly(`FOCUS_LABELS[${k}]`, FOCUS[k]));

/* ── Coverage: every word tested once for meaning and once in a sentence ── */
if (VOCAB && FOCUS) {
  const count = { exB: new Map(), exC: new Map() };
  Object.keys(FOCUS).forEach(ref => {
    const dot = ref.indexOf('.');
    if (dot === -1) return fail(`FOCUS_LABELS key "${ref}" should look like "exB.g1"`);
    const ex = ref.slice(0, dot);
    if (!count[ex]) return fail(`FOCUS_LABELS key "${ref}" names an unknown exercise "${ex}" (expected exB or exC)`);
    const w = FOCUS[ref];
    count[ex].set(w, (count[ex].get(w) || 0) + 1);
  });
  const named = { exB: 'multiple-choice definitions', exC: 'cloze sentences' };
  ['exB', 'exC'].forEach(ex => {
    words.forEach(w => {
      const n = count[ex].get(w) || 0;
      if (n === 0) fail(`"${w}" is never tested in the ${named[ex]} — every word on the list must come up`);
      if (n > 1)   fail(`"${w}" is tested ${n} times in the ${named[ex]} — once each is enough, and repeats cost another word its slot`);
    });
    [...count[ex].keys()].forEach(w => {
      if (!words.includes(w)) fail(`the ${named[ex]} test "${w}", which is not on the word list`);
    });
  });
}

/* ── Every gap has an answer, a label, and options that contain it ── */
function checkGaps(ex, answers) {
  if (!answers) return;
  Object.keys(answers).forEach(g => {
    const ref = ex + '.' + g;
    if (FOCUS && !(ref in FOCUS)) {
      fail(`gap ${ref} has an answer but no FOCUS_LABELS entry, so the end review cannot report it`);
    }
    const id = ex + '-' + g;
    const sel = new RegExp('<select[^>]*id="' + id + '"[\\s\\S]*?</select>').exec(html);
    if (!sel) return fail(`no <select id="${id}"> in the page, but ${ex.toUpperCase()} has an answer for ${g}`);
    /* The `— choose —` placeholder carries value="" and is not an answer a
       student can be right with, so it must not count towards the options. */
    const opts = [...sel[0].matchAll(/<option([^>]*)>([\s\S]*?)<\/option>/g)]
      .filter(m => !/value\s*=\s*(""|'')/.test(m[1]))
      .map(m => m[2].replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, "'").replace(/&quot;/g, '"').trim())
      .filter(Boolean);
    if (!opts.includes(answers[g])) {
      fail(`gap ${id}: the answer "${answers[g]}" is not one of its options (${opts.join(' / ')})`);
    }
    if (opts.length < 3) {
      fail(`gap ${id} offers only ${opts.length} real options — too easy to guess`);
    }
    const dupes = opts.filter((o, i, a) => a.indexOf(o) !== i);
    if (dupes.length) fail(`gap ${id} lists "${dupes[0]}" twice`);
  });
  /* A select the answer key forgot is a gap that can never be marked. */
  [...html.matchAll(new RegExp('<select[^>]*id="' + ex + '-(g\\d+)"', 'g'))].forEach(m => {
    if (!(m[1] in answers)) fail(`<select id="${ex}-${m[1]}"> has no entry in ${ex.toUpperCase()}_ANSWERS, so it can never be marked correct`);
  });
}
checkGaps('exB', B_ANS);
checkGaps('exC', C_ANS);

/* ── The page must actually ask for the end review ── */
if (!/id="focus-words"/.test(html)) fail('no <div id="focus-words"> — the end review has nowhere to render');
if (!/renderFocusWords\s*\(/.test(html)) fail('renderFocusWords() is never called, so the end review stays empty');

/* ── Report ── */
const label = `${file}: ${words.length} words`;
if (problems.length) {
  console.error(`✗ ${label} — ${problems.length} problem(s)`);
  problems.forEach(p => console.error('  · ' + p));
  process.exit(1);
}
console.log(`✓ ${label}, each tested once for meaning and once in a sentence; answers, options and the end review all wired up.`);
