#!/usr/bin/env node
'use strict';

/*
 * search-opportunities.js — Agent #5: Search Console Responder
 *
 * Analyses the site's existing pages against common ESL/grammar search
 * patterns and identifies gaps — topics people search for that the site
 * doesn't cover well yet, or pages with weak titles/descriptions.
 *
 * Two modes:
 *   1. --audit   Scans existing pages and suggests SEO improvements
 *   2. --gaps    Cross-references topics.json coverage against known
 *                high-demand grammar search queries
 *
 * Usage:
 *   node scripts/search-opportunities.js --audit
 *   node scripts/search-opportunities.js --gaps
 *   node scripts/search-opportunities.js --all
 *
 * Search Console import — the web export (Performance → Export → CSV), unzipped:
 *   node scripts/search-opportunities.js --csv path/to/export-folder
 *   node scripts/search-opportunities.js --csv path/to/Queries.csv
 *   Options: --min-impr N (default 20), --ratio R (default 0.5)
 *   Prints leaks (page 1, CTR far below the export's own CTR for that
 *   position) for queries and pages, then gaps (position past 10, zero clicks).
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const STATE_PATH = path.join(ROOT, 'data', 'search-opportunities-state.json');

function readState() {
  try { return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8')); }
  catch { return null; }
}

function writeState(state) {
  state.ts = new Date().toISOString();
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2) + '\n');
}

function printDelta(prev, curr) {
  let anyChange = false;

  // Audit diffs — compare file lists per issue type
  if (prev.audit && curr.audit) {
    for (const type of new Set([...Object.keys(prev.audit), ...Object.keys(curr.audit)])) {
      const prevFiles = prev.audit[type] || [];
      const currFiles = curr.audit[type] || [];
      const added = currFiles.filter(f => !prevFiles.includes(f));
      const fixed = prevFiles.filter(f => !currFiles.includes(f));
      if (added.length || fixed.length) {
        anyChange = true;
        for (const f of added) console.log(`  NEW    [${type}] ${f}`);
        for (const f of fixed) console.log(`  FIXED  [${type}] ${f}`);
      }
    }
  }

  // Gap diffs — compare by query string
  if (prev.gaps && curr.gaps) {
    const prevQueries = new Set(prev.gaps.map(g => g.query));
    const currQueries = new Set(curr.gaps.map(g => g.query));
    const newGaps = curr.gaps.filter(g => !prevQueries.has(g.query));
    const goneGaps = prev.gaps.filter(g => !currQueries.has(g.query));
    if (newGaps.length || goneGaps.length) {
      anyChange = true;
      for (const g of newGaps) console.log(`  NEW GAP     "${g.query}" [${g.status}]`);
      for (const g of goneGaps) console.log(`  NOW COVERED "${g.query}"`);
    }
  }

  if (!anyChange) {
    console.log('No changes since last run (' + prev.ts + ').');
  }
}

// ── High-demand ESL grammar queries (based on search volume research) ───────
// These are the queries German students and ESL learners actually type.
// Ranked by estimated monthly volume in DACH region.

const HIGH_DEMAND_QUERIES = [
  { query: 'if clauses übungen', topic: 'if-saetze', lang: 'de', volume: 'high' },
  { query: 'passive voice exercises', topic: 'passiv', lang: 'en', volume: 'high' },
  { query: 'reported speech übungen', topic: 'reported-speech', lang: 'de', volume: 'high' },
  { query: 'relative clauses exercises', topic: 'relativsaetze', lang: 'en', volume: 'high' },
  { query: 'gerund or infinitive übungen', topic: 'gerund-infinitiv', lang: 'de', volume: 'high' },
  { query: 'present perfect übungen', topic: 'present-perfect', lang: 'de', volume: 'high' },
  { query: 'simple past present perfect unterschied', topic: 'present-perfect', lang: 'de', volume: 'high' },
  { query: 'englisch grammatik übungen klasse 8', topic: null, lang: 'de', volume: 'high' },
  { query: 'englisch grammatik übungen klasse 10', topic: null, lang: 'de', volume: 'high' },
  { query: 'modal verbs exercises', topic: 'modalverben', lang: 'en', volume: 'medium' },
  { query: 'passive voice übungen klasse 8', topic: 'passiv', lang: 'de', volume: 'medium' },
  { query: 'conditional sentences exercises', topic: 'if-saetze', lang: 'en', volume: 'medium' },
  { query: 'past perfect exercises', topic: null, lang: 'en', volume: 'medium' },
  { query: 'future tenses exercises', topic: null, lang: 'en', volume: 'medium' },
  { query: 'comparatives superlatives exercises', topic: null, lang: 'en', volume: 'medium' },
  { query: 'english exercises online free', topic: null, lang: 'en', volume: 'high' },
  { query: 'MSA englisch übungen', topic: null, lang: 'de', volume: 'medium' },
  { query: 'abitur englisch übungen', topic: null, lang: 'de', volume: 'medium' },
  { query: 'business english exercises', topic: null, lang: 'en', volume: 'medium' },
  { query: 'articles a an the exercises', topic: null, lang: 'en', volume: 'medium' },
];

// ── Audit existing pages ────────────────────────────────────────────────────

function auditPages() {
  const issues = [];
  const exercisesPath = path.join(ROOT, 'data', 'exercises.json');
  if (!fs.existsSync(exercisesPath)) {
    console.error('data/exercises.json missing — run node scripts/build.js first');
    process.exit(1);
  }

  const exercises = JSON.parse(fs.readFileSync(exercisesPath, 'utf8'));

  for (const ex of exercises) {
    const filePath = path.join(ROOT, ex.file);
    if (!fs.existsSync(filePath)) continue;
    const content = fs.readFileSync(filePath, 'utf8');

    // Check meta description
    const descMatch = content.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
    const desc = descMatch ? descMatch[1] : '';
    if (!desc || desc.includes('TODO')) {
      issues.push({ file: ex.file, type: 'missing-description', msg: 'No meta description or contains TODO' });
    } else if (desc.length < 50) {
      issues.push({ file: ex.file, type: 'short-description', msg: `Meta description too short (${desc.length} chars)` });
    } else if (desc.length > 160) {
      issues.push({ file: ex.file, type: 'long-description', msg: `Meta description too long (${desc.length} chars, truncated in SERP)` });
    }

    // Check title
    const titleMatch = content.match(/<title>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1] : '';
    if (!title || title.includes('TODO')) {
      issues.push({ file: ex.file, type: 'missing-title', msg: 'No title or contains TODO' });
    } else if (title.length > 60) {
      issues.push({ file: ex.file, type: 'long-title', msg: `Title too long for SERP (${title.length} chars)` });
    }
    if (title && !title.includes('englishonline.training')) {
      issues.push({ file: ex.file, type: 'title-no-brand', msg: 'Title missing brand suffix "| englishonline.training"' });
    }

    // Check canonical
    const canonMatch = content.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']*)["']/i);
    if (!canonMatch) {
      issues.push({ file: ex.file, type: 'missing-canonical', msg: 'No canonical link' });
    }
  }

  return issues;
}

// ── Topic gap analysis ──────────────────────────────────────────────────────

function analyseGaps() {
  const topicsPath = path.join(ROOT, 'data', 'topics.json');
  const exercisesPath = path.join(ROOT, 'data', 'exercises.json');

  const topics = fs.existsSync(topicsPath)
    ? JSON.parse(fs.readFileSync(topicsPath, 'utf8'))
    : [];
  const exercises = fs.existsSync(exercisesPath)
    ? JSON.parse(fs.readFileSync(exercisesPath, 'utf8'))
    : [];

  const topicSlugs = new Set(topics.map(t => t.slug));
  const exerciseTopics = new Set(exercises.flatMap(e => e.topics || []));

  const gaps = [];
  const covered = [];

  for (const q of HIGH_DEMAND_QUERIES) {
    const hasTopic = q.topic && topicSlugs.has(q.topic);
    const hasExercises = q.topic && exerciseTopics.has(q.topic);

    if (hasTopic && hasExercises) {
      covered.push({ ...q, status: 'covered', note: `Topic page + exercises exist` });
    } else if (hasTopic && !hasExercises) {
      gaps.push({ ...q, status: 'topic-only', note: `Topic page exists but no exercises tagged with this topic` });
    } else if (!hasTopic && hasExercises) {
      gaps.push({ ...q, status: 'no-landing', note: `Exercises exist but no themen/ landing page` });
    } else {
      gaps.push({ ...q, status: 'uncovered', note: `No topic page or tagged exercises` });
    }
  }

  return { gaps, covered };
}

// ── Search Console import (--csv) ───────────────────────────────────────────
// Input is the Search Console web export (Performance → Export → CSV), unzipped:
// a folder holding Queries.csv (required) and Pages.csv (optional), or one of
// those two files on its own. The web export never links a query to a page, so
// leaks are listed twice — per query and per page — and gaps per query only.
//
// Every number below comes from the export itself. CTR is recomputed from
// clicks / impressions, so the export's own CTR column (and its locale format,
// "1.2%" vs "1,2 %") is never parsed.

const LEAK_DEFAULTS = { minImpr: 20, ratio: 0.5 };

const STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'what', 'how', 'are', 'was', 'were', 'you', 'your',
  'from', 'that', 'this', 'does', 'into', 'der', 'die', 'das', 'und', 'mit', 'für',
  'ein', 'eine', 'einen', 'wie', 'ist', 'von', 'auf', 'den', 'dem', 'des',
]);

// RFC 4180: quoted fields, "" escapes, commas and newlines inside quotes, CRLF.
function parseCsv(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false;
  text = text.replace(/^﻿/, '');
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += c;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows.filter(r => r.some(f => f.trim() !== ''));
}

// Clicks and impressions are whole numbers: drop any thousands separator.
function toInt(s) {
  return parseInt(String(s).replace(/[^\d]/g, ''), 10) || 0;
}

// Position is a decimal; a German-locale export writes "8,5".
function toDecimal(s) {
  let t = String(s).replace(/[\s ]/g, '');
  if (t.includes(',') && !t.includes('.')) t = t.replace(',', '.');
  return parseFloat(t) || 0;
}

// Columns are found by position, as Search Console always writes them, and the
// header is checked against both the English and the German UI wording.
const HEADER_CHECKS = [/cli|kli/i, /impr/i, /ctr/i, /pos/i];

function readGscCsv(file) {
  const rows = parseCsv(fs.readFileSync(file, 'utf8'));
  const header = rows[0] || [];
  const ok = header.length >= 5 && HEADER_CHECKS.every((re, i) => re.test(header[i + 1]));
  if (!ok) {
    throw new Error(`${file}: expected the columns <Query or Page>, Clicks, Impressions, CTR, Position; got: ${header.join(', ')}`);
  }
  return rows.slice(1).map(r => {
    const clicks = toInt(r[1]);
    const impressions = toInt(r[2]);
    return {
      key: r[0].trim(),
      clicks,
      impressions,
      ctr: impressions ? clicks / impressions : 0,
      position: toDecimal(r[4]),
    };
  }).filter(r => r.key && r.impressions > 0);
}

// Find Queries.csv / Pages.csv. A lone file is sorted by its header's first column.
function locateExport(p) {
  if (!fs.existsSync(p)) throw new Error(`Not found: ${p}`);
  if (fs.statSync(p).isDirectory()) {
    const pick = name => {
      const f = fs.readdirSync(p).find(n => n.toLowerCase() === name);
      return f ? path.join(p, f) : null;
    };
    const queries = pick('queries.csv');
    if (!queries) throw new Error(`${p} has no Queries.csv — unzip the Search Console export into it`);
    return { queries, pages: pick('pages.csv') };
  }
  const first = (parseCsv(fs.readFileSync(p, 'utf8'))[0] || [''])[0].toLowerCase();
  return /page|seite/.test(first) ? { queries: null, pages: p } : { queries: p, pages: null };
}

// Rows on page 1, bucketed by rounded position (1–10).
function page1Bucket(position) {
  const b = Math.round(position);
  return b >= 1 && b <= 10 ? b : null;
}

// A leak: page 1, enough impressions, and a CTR below `ratio` × the CTR every
// OTHER row in the export earns at the same rounded position. The row itself is
// left out of its own baseline, or one big row would set the bar it is judged by.
function findLeaks(rows, opts = {}) {
  const { minImpr, ratio } = { ...LEAK_DEFAULTS, ...opts };
  const buckets = {};
  for (const r of rows) {
    const b = page1Bucket(r.position);
    if (b === null) continue;
    buckets[b] = buckets[b] || { clicks: 0, impressions: 0 };
    buckets[b].clicks += r.clicks;
    buckets[b].impressions += r.impressions;
  }
  const leaks = [];
  let noBaseline = 0;
  for (const r of rows) {
    const b = page1Bucket(r.position);
    if (b === null || r.impressions < minImpr) continue;
    const restImpr = buckets[b].impressions - r.impressions;
    const restClicks = buckets[b].clicks - r.clicks;
    if (restImpr < minImpr) { noBaseline++; continue; }
    const expected = restClicks / restImpr;
    if (expected > 0 && r.ctr < expected * ratio) leaks.push({ ...r, expected });
  }
  leaks.sort((a, b) => b.impressions - a.impressions);
  return { leaks, noBaseline };
}

function queryWords(q) {
  return q.toLowerCase().split(/[^a-zäöüß0-9]+/).filter(w => w.length >= 3 && !STOPWORDS.has(w));
}

// Activities pages whose title holds every word of the query. WordPress pages
// are not in this repo, so a gap with no match may still have a WP page.
function titleMatches(query, pages) {
  const words = queryWords(query);
  if (!words.length) return [];
  return pages.filter(p => words.every(w => p.title.toLowerCase().includes(w))).map(p => p.file);
}

function loadPageTitles() {
  const read = f => {
    const p = path.join(ROOT, 'data', f);
    return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : [];
  };
  return [
    ...read('exercises.json').map(e => ({ file: e.file, title: e.title || '' })),
    ...read('topics.json').map(t => ({ file: `themen/${t.slug}.html`, title: `${t.de || ''} ${t.en || ''}` })),
  ];
}

// A gap: real impressions, average position past 10, no clicks.
function findGaps(rows, pages, opts = {}) {
  const { minImpr } = { ...LEAK_DEFAULTS, ...opts };
  return rows
    .filter(r => r.position > 10 && r.clicks === 0 && r.impressions >= minImpr)
    .sort((a, b) => b.impressions - a.impressions)
    .map(r => ({ ...r, matches: titleMatches(r.key, pages) }));
}

function pct(x) { return (x * 100).toFixed(1) + '%'; }

function printList(title, items, fmt, limit = 20) {
  console.log(`${title} (${items.length}):`);
  if (!items.length) console.log('  none');
  for (const it of items.slice(0, limit)) console.log('  ' + fmt(it));
  if (items.length > limit) console.log(`  … and ${items.length - limit} more`);
  console.log();
}

function reportGsc(p, opts) {
  const files = locateExport(p);
  const fmtLeak = r => `"${r.key}" — ${r.impressions} imp, ${r.clicks} clicks, pos ${r.position.toFixed(1)}, CTR ${pct(r.ctr)} vs ${pct(r.expected)} at that position`;
  console.log(`Thresholds: at least ${opts.minImpr} impressions; a leak's CTR is under ${opts.ratio} × the export's CTR at the same position.\n`);

  if (files.queries) {
    const rows = readGscCsv(files.queries);
    const { leaks, noBaseline } = findLeaks(rows, opts);
    printList('Leaks — queries (page 1, CTR far below normal for the position)', leaks, fmtLeak);
    if (noBaseline) console.log(`  (${noBaseline} page-1 queries skipped: too few other impressions at their position to compare)\n`);
    const gaps = findGaps(rows, loadPageTitles(), opts);
    printList('Gaps — queries (position past 10, zero clicks)', gaps, r =>
      `"${r.key}" — ${r.impressions} imp, pos ${r.position.toFixed(1)}` +
      (r.matches.length ? ` · activities title match: ${r.matches.slice(0, 2).join(', ')}` : ' · no activities title match (WordPress not checked)'));
  }
  if (files.pages) {
    const { leaks, noBaseline } = findLeaks(readGscCsv(files.pages), opts);
    printList('Leaks — pages', leaks, fmtLeak);
    if (noBaseline) console.log(`  (${noBaseline} page-1 pages skipped: too few other impressions at their position to compare)\n`);
  }
  console.log('Next: for each leak, check whether an AI Overview sits above us or the title is weak (Tier 12.6).');
  console.log('Gaps feed Tier 12.8 repoints and Tier 10 sections, not new pages (Tier 9.5).');
}

// ── Main ────────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const runAll = args.includes('--all') || args.length === 0;
  const ranChecks = runAll || args.includes('--audit') || args.includes('--gaps');

  const prev = readState();
  const currentState = {};

  console.log('Search Opportunities Report');
  console.log('='.repeat(60));

  if (runAll || args.includes('--audit')) {
    console.log('\n## Page SEO Audit\n');
    const issues = auditPages();

    // Build audit state: file lists per issue type
    const auditState = {};
    for (const i of issues) {
      auditState[i.type] = auditState[i.type] || [];
      auditState[i.type].push(i.file);
    }
    currentState.audit = auditState;

    if (issues.length === 0) {
      console.log('All pages have complete meta tags.');
    } else {
      const grouped = {};
      for (const i of issues) {
        grouped[i.type] = grouped[i.type] || [];
        grouped[i.type].push(i);
      }
      for (const [type, items] of Object.entries(grouped)) {
        console.log(`${type} (${items.length}):`);
        for (const item of items.slice(0, 5)) {
          console.log(`  ${item.file}: ${item.msg}`);
        }
        if (items.length > 5) console.log(`  … and ${items.length - 5} more`);
        console.log();
      }
    }
  }

  if (runAll || args.includes('--gaps')) {
    console.log('\n## Topic Gap Analysis\n');
    const { gaps, covered } = analyseGaps();

    currentState.gaps = gaps.map(g => ({ query: g.query, status: g.status }));
    currentState.covered = covered.map(c => ({ query: c.query, topic: c.topic }));

    console.log(`Covered (${covered.length}):`);
    for (const c of covered) {
      console.log(`  ✓ "${c.query}" → ${c.topic}`);
    }

    console.log(`\nGaps (${gaps.length}):`);
    const high = gaps.filter(g => g.volume === 'high');
    const medium = gaps.filter(g => g.volume === 'medium');

    if (high.length > 0) {
      console.log('\n  HIGH PRIORITY:');
      for (const g of high) {
        console.log(`  ✗ "${g.query}" [${g.status}] — ${g.note}`);
      }
    }
    if (medium.length > 0) {
      console.log('\n  MEDIUM PRIORITY:');
      for (const g of medium) {
        console.log(`  ○ "${g.query}" [${g.status}] — ${g.note}`);
      }
    }
  }

  if (args.includes('--csv')) {
    const csvPath = args[args.indexOf('--csv') + 1];
    const num = (flag, dflt) => {
      const i = args.indexOf(flag);
      if (i === -1) return dflt;
      const v = Number(args[i + 1]);
      if (!(v > 0)) { console.error(`${flag} needs a positive number`); process.exit(1); }
      return v;
    };
    console.log('\n## Search Console Import\n');
    try {
      reportGsc(csvPath || '', {
        minImpr: num('--min-impr', LEAK_DEFAULTS.minImpr),
        ratio: num('--ratio', LEAK_DEFAULTS.ratio),
      });
    } catch (err) {
      console.error(err.message);
      process.exit(1);
    }
  }

  // The CSV import keeps no state. Writing state after a --csv-only run would
  // overwrite the last audit/gaps state with nothing, and the next delta would
  // be empty.
  if (!ranChecks) return;

  // Write state after all checks
  writeState(currentState);

  if (prev && !args.includes('--no-diff')) {
    console.log();
    console.log('Δ Delta');
    console.log('-'.repeat(40));
    printDelta(prev, currentState);
  }
}

if (require.main === module) main();

module.exports = { parseCsv, toInt, toDecimal, readGscCsv, locateExport, findLeaks, findGaps, titleMatches };
