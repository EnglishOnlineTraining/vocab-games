/*
 * item-analysis.js — per-gap statistics for the quality loop (agent #11,
 * docs/agent-backlog.md). Finds gaps that are too easy, too hard, ambiguous or
 * dominated by one wrong answer, and writing prompts that learners skip.
 *
 *   node scripts/item-analysis.js --csv <export.csv>   Make/Excel or Abitur export
 *   node scripts/item-analysis.js --sheets             fetch itemstats from Apps Script
 *   node scripts/item-analysis.js --stats <file.json>  an itemstats response saved to disk
 *   options: --min 15  --json  --since YYYY-MM-DD
 *
 * --sheets reads ITEMSTATS_URL_ONLINE, ITEMSTATS_URL_UNI and ITEMSTATS_TOKEN.
 *
 * PRIVACY. Exports hold names; keep them and the report in CLAUDE OUTPUTS. This
 * script never prints a name, class, email or free text: output is counts per gap,
 * and a wrong answer is shown only when at least 2 learners gave it and it is 40
 * characters or fewer (WRONG_MIN, WRONG_MAX_LEN). apps-script.gs's itemstats applies
 * the same rule before anything leaves the sheet; test-item-analysis.js checks both
 * produce the same counts and that no fixture name reaches the output.
 *
 * Exit codes: 0 ran (flagged or not), 2 input or fetch error. The number of flagged
 * items is printed and, under GitHub Actions, written to $GITHUB_OUTPUT as `flagged`.
 */
const fs = require('fs');
const path = require('path');
const { normAns, unflat, BLANK, BLANK_LEGACY } = require('../make-grader.js');
const { parseCsv } = require('./regrade-rows.js');

const KEYS = path.join(__dirname, '..', 'data', 'answer-keys');
const WRONG_MIN = 2;
const WRONG_MAX_LEN = 40;
const OTHER = '(other)';

// distractorMinWrong: below 5 wrong answers in all, one answer taking > 40 % is noise.
const RULES = { easy: 0.9, hard: 0.3, distractor: 0.4, distractorMinWrong: 5, skipped: 0.25, early: 30 };

// ── counting (mirrored by itemStatsForUnit in apps-script.gs) ───────────────

function isBlank(v, gap) {
  if (v == null || v === '' || v === BLANK) return true;
  return v === BLANK_LEGACY && !(gap && gap.accept.indexOf(BLANK_LEGACY) !== -1);
}

function wordCount(s) {
  const t = String(s).trim();
  return t ? t.split(/\s+/).length : 0;
}

function median(a) {
  if (!a.length) return 0;
  const s = a.slice().sort((x, y) => x - y), m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/* One accumulator per unit. `sections` per submission: { exA: { g1: 'x' }, … },
   already unflattened. Returns per-gap correctness for the row (for discrimination). */
function newUnit() { return { rows: 0, gaps: {}, writing: {} }; }

function addSubmission(acc, key, sections) {
  acc.rows++;
  const result = {};
  for (const sk of Object.keys(key.sections)) {
    const sec = key.sections[sk];
    const given = sections[sk] || {};
    for (const g of Object.keys(sec.gaps)) {
      const gap = sec.gaps[g], id = sk + '.' + g;
      const c = acc.gaps[id] || (acc.gaps[id] = { correct: 0, blank: 0, wrong: {} });
      const v = given[g];
      if (isBlank(v, gap)) { c.blank++; result[id] = false; continue; }
      const shown = sec.typed ? normAns(v) : String(v);
      const ok = sec.typed ? gap.accept.some(a => normAns(a) === shown) : gap.accept.indexOf(v) !== -1;
      if (ok) c.correct++; else c.wrong[shown] = (c.wrong[shown] || 0) + 1;
      result[id] = ok;
    }
  }
  // Writing: any answer field of an ex* section that the key does not grade.
  for (const sk of Object.keys(sections)) {
    if (!/^ex/i.test(sk)) continue;
    const graded = (key.sections[sk] && key.sections[sk].gaps) || {};
    for (const f of Object.keys(sections[sk])) {
      if (f in graded) continue;
      const id = sk + '.' + f;
      const w = acc.writing[id] || (acc.writing[id] = { n: 0, blank: 0, words: [] });
      w.n++;
      if (isBlank(sections[sk][f])) w.blank++; else w.words.push(wordCount(sections[sk][f]));
    }
  }
  return result;
}

/* Drop rare or long wrong answers into (other), and words[] into a median.
   Same shape as one unit of the itemstats response. */
function finishUnit(acc) {
  const out = { rows: acc.rows, gaps: {}, writing: {} };
  for (const id of Object.keys(acc.gaps)) {
    const c = acc.gaps[id], wrong = {};
    for (const a of Object.keys(c.wrong)) {
      const k = (c.wrong[a] >= WRONG_MIN && a.length <= WRONG_MAX_LEN) ? a : OTHER;
      wrong[k] = (wrong[k] || 0) + c.wrong[a];
    }
    out.gaps[id] = { correct: c.correct, blank: c.blank, wrong };
  }
  for (const id of Object.keys(acc.writing)) {
    const w = acc.writing[id];
    out.writing[id] = { n: w.n, blank: w.blank, medianWords: median(w.words) };
  }
  return out;
}

// ── inputs ──────────────────────────────────────────────────────────────────

const keyCache = {};
function loadKey(unit) {
  if (unit in keyCache) return keyCache[unit];
  const p = path.join(KEYS, unit + '.json');
  return (keyCache[unit] = fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null);
}

/* Excel exports a date as text or as a serial day number. */
function rowDate(v) {
  const s = String(v || '').trim();
  if (/^\d+(\.\d+)?$/.test(s)) return new Date((parseFloat(s) - 25569) * 864e5);
  const d = new Date(s);
  return isNaN(d) ? null : d;
}

function keepRow(row, since) {
  if (!since) return true;
  const d = rowDate(row[0]);
  return !!d && d >= since;
}

/* Make/Excel: the raw payload column (found by content, as regrade-rows.js does). */
function fromMakeCsv(rows, since) {
  let col = -1;
  for (let c = 0; c < rows[0].length && col === -1; c++) {
    for (let r = 1; r < rows.length; r++) {
      const v = (rows[r][c] || '').trim();
      if (v.startsWith('{') && v.includes('"unit"')) { col = c; break; }
    }
  }
  if (col === -1) return null;

  const units = {}, perRow = {}, noKey = new Set();
  let bad = 0;
  for (let r = 1; r < rows.length; r++) {
    const raw = (rows[r][col] || '').trim();
    if (!raw || !keepRow(rows[r], since)) continue;
    let p;
    try { p = JSON.parse(raw); } catch (e) { bad++; continue; }
    const key = loadKey(p.unit);
    if (!key) { if (p.unit) noKey.add(p.unit); continue; }
    const sections = {};
    for (const k of Object.keys(p)) if (/^ex/i.test(k)) sections[k] = unflat(p[k]);
    const res = addSubmission(units[p.unit] || (units[p.unit] = newUnit()), key, sections);
    (perRow[p.unit] || (perRow[p.unit] = [])).push(res);
  }
  const out = {};
  for (const u of Object.keys(units)) out[u] = finishUnit(units[u]);
  return { source: 'csv', units: out, perRow, noKey: [...noKey].sort(), bad };
}

/* Abitur (abitursubs): Unit, Ex1–Ex5 as "4/6", Essay. Exercise-level only. */
function fromAbiturCsv(rows, since) {
  const h = rows[0].map(x => String(x).trim().toLowerCase());
  const ui = h.indexOf('unit'), ei = h.indexOf('essay');
  const exCols = [1, 2, 3, 4, 5].map(i => h.indexOf('ex' + i));
  if (ui === -1 || exCols.some(i => i === -1)) return null;

  const units = {};
  for (let r = 1; r < rows.length; r++) {
    const unit = (rows[r][ui] || '').trim();
    if (!unit || !keepRow(rows[r], since)) continue;
    const acc = units[unit] || (units[unit] = { rows: 0, exercises: {}, essay: { n: 0, blank: 0, words: [] } });
    acc.rows++;
    exCols.forEach((c, i) => {
      const m = /^\s*(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)\s*$/.exec(rows[r][c] || '');
      if (!m || !+m[2]) return;
      const e = acc.exercises['ex' + (i + 1)] || (acc.exercises['ex' + (i + 1)] = { n: 0, earned: 0, possible: 0 });
      e.n++; e.earned += +m[1]; e.possible += +m[2];
    });
    if (ei !== -1) {
      const t = rows[r][ei] || '';
      acc.essay.n++;
      if (isBlank(t.trim())) acc.essay.blank++; else acc.essay.words.push(wordCount(t));
    }
  }
  return { source: 'abitur', units, noKey: [] };
}

async function fromSheets(since) {
  const token = process.env.ITEMSTATS_TOKEN;
  const urls = [process.env.ITEMSTATS_URL_ONLINE, process.env.ITEMSTATS_URL_UNI].filter(Boolean);
  if (!token || !urls.length) throw new Error('set ITEMSTATS_TOKEN and ITEMSTATS_URL_ONLINE / ITEMSTATS_URL_UNI');
  const parts = [];
  for (const u of urls) {
    const q = '?action=itemstats&token=' + encodeURIComponent(token) + (since ? '&since=' + since.toISOString().slice(0, 10) : '');
    const res = await fetch(u + q, { redirect: 'follow' });
    if (!res.ok) throw new Error('itemstats HTTP ' + res.status);
    const body = await res.json();
    if (body.error) throw new Error('itemstats: ' + body.error);
    parts.push(body);
  }
  return mergeStats(parts);
}

/* Several itemstats responses (online + uni sheet) → one. A unit in both is summed. */
function mergeStats(parts) {
  const units = {}, unmatched = new Set();
  for (const p of parts) {
    (p.unmatchedTabs || []).forEach(t => unmatched.add(t));
    for (const [u, s] of Object.entries(p.units || {})) {
      if (!units[u]) { units[u] = JSON.parse(JSON.stringify(s)); continue; }
      const t = units[u];
      t.rows += s.rows;
      for (const [id, g] of Object.entries(s.gaps)) {
        const d = t.gaps[id] || (t.gaps[id] = { correct: 0, blank: 0, wrong: {} });
        d.correct += g.correct; d.blank += g.blank;
        for (const [a, n] of Object.entries(g.wrong)) d.wrong[a] = (d.wrong[a] || 0) + n;
      }
      // Medians cannot be merged exactly; keep the one from the larger sample.
      for (const [id, w] of Object.entries(s.writing || {})) {
        const d = t.writing[id];
        if (!d) t.writing[id] = w;
        else t.writing[id] = { n: d.n + w.n, blank: d.blank + w.blank, medianWords: (w.n > d.n ? w : d).medianWords };
      }
    }
  }
  return { source: 'sheets', units, unmatchedTabs: [...unmatched].sort(), noKey: [] };
}

// ── report ──────────────────────────────────────────────────────────────────

/* Discrimination per gap: share correct in the top third of unit scores minus the
   bottom third. <= 0 means the strongest learners do no better: likely ambiguous. */
function discrimination(rows) {
  const scored = rows.map(r => ({ r, s: Object.values(r).filter(Boolean).length }))
    .sort((a, b) => b.s - a.s);
  const k = Math.floor(scored.length / 3);
  if (!k) return {};
  const top = scored.slice(0, k), bot = scored.slice(-k), out = {};
  for (const id of Object.keys(rows[0] || {})) {
    const p = g => g.filter(x => x.r[id]).length / g.length;
    out[id] = p(top) - p(bot);
  }
  return out;
}

function report(data, min) {
  const gaps = [], writing = [];
  if (data.source === 'abitur') {
    for (const [unit, u] of Object.entries(data.units)) {
      for (const [ex, e] of Object.entries(u.exercises)) {
        const correct = e.earned / e.possible;
        gaps.push(gapEntry({ unit, gap: ex, n: e.n, correct, topWrong: null }, min, null));
      }
      if (u.essay.n) writing.push(writingEntry(unit, 'essay', u.essay.n, u.essay.blank, median(u.essay.words), min));
    }
  } else {
    for (const [unit, u] of Object.entries(data.units)) {
      const disc = data.perRow && data.perRow[unit] && data.perRow[unit].length >= min
        ? discrimination(data.perRow[unit]) : null;
      for (const [id, g] of Object.entries(u.gaps)) {
        const wrongN = Object.values(g.wrong).reduce((a, b) => a + b, 0);
        const n = g.correct + g.blank + wrongN;
        let top = null;
        for (const [a, c] of Object.entries(g.wrong)) {
          if (a !== OTHER && (!top || c > top.count)) top = { answer: a, count: c };
        }
        const topWrong = top ? { answer: top.answer, share: round(top.count / wrongN), wrongN } : null;
        gaps.push(gapEntry({ unit, gap: id, n, correct: n ? g.correct / n : 0, topWrong }, min, disc ? disc[id] : null));
      }
      for (const [id, w] of Object.entries(u.writing || {})) {
        writing.push(writingEntry(unit, id, w.n, w.blank, w.medianWords, min));
      }
    }
  }
  const flagged = gaps.filter(g => g.flags.length).length + writing.filter(w => w.flags.length).length;
  return { source: data.source, min, flagged, gaps, writing,
    noKey: data.noKey || [], unmatchedTabs: data.unmatchedTabs || [] };
}

function round(x) { return Math.round(x * 100) / 100; }

function gapEntry(e, min, disc) {
  e.correct = round(e.correct);
  e.flags = [];
  if (e.n < min) { e.signal = 'not enough data'; return e; }
  if (e.correct > RULES.easy) e.flags.push('too easy');
  if (e.correct < RULES.hard) e.flags.push('too hard');
  if (disc != null && disc <= 0) e.flags.push('ambiguous');
  if (e.topWrong && e.topWrong.wrongN >= RULES.distractorMinWrong && e.topWrong.share > RULES.distractor) e.flags.push('distractor');
  if (disc != null) e.discrimination = round(disc);
  if (e.n < RULES.early) e.signal = 'early';
  return e;
}

function writingEntry(unit, field, n, blank, medianWords, min) {
  const e = { unit, field, n, blank: n ? round(blank / n) : 0, medianWords, flags: [] };
  if (n < min) e.signal = 'not enough data';
  else if (e.blank > RULES.skipped) e.flags.push('skipped');
  return e;
}

function pct(x) { return Math.round(x * 100) + '%'; }

function printText(r) {
  const lines = ['Item analysis (' + r.source + '), min ' + r.min + ' answers', ''];
  const flagged = r.gaps.filter(g => g.flags.length);
  lines.push('Flagged gaps: ' + flagged.length);
  for (const g of flagged) {
    lines.push('  ' + g.unit + ' ' + g.gap + '  n=' + g.n + '  ' + pct(g.correct) + ' correct  ['
      + g.flags.join(', ') + ']' + (g.signal ? ' (' + g.signal + ')' : '')
      + (g.topWrong ? '  top wrong: "' + g.topWrong.answer + '" ' + pct(g.topWrong.share) + ' of wrong' : ''));
  }
  const wf = r.writing.filter(w => w.flags.length);
  lines.push('', 'Flagged writing fields: ' + wf.length);
  for (const w of wf) {
    lines.push('  ' + w.unit + ' ' + w.field + '  n=' + w.n + '  ' + pct(w.blank) + ' blank  median '
      + w.medianWords + ' words  [' + w.flags.join(', ') + ']');
  }
  const thin = r.gaps.filter(g => g.signal === 'not enough data').length;
  lines.push('', 'Not enough data: ' + thin + ' gap(s) under ' + r.min + ' answers.');
  if (r.noKey.length) lines.push('No answer key: ' + r.noKey.join(', '));
  if (r.unmatchedTabs.length) lines.push('Sheet tabs with no keyed unit: ' + r.unmatchedTabs.join(', '));
  lines.push('', 'flagged: ' + r.flagged);
  return lines.join('\n');
}

// ── main ────────────────────────────────────────────────────────────────────

function arg(name) {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] : null;
}

async function main() {
  const min = parseInt(arg('--min') || '15', 10);
  const sinceArg = arg('--since');
  const since = sinceArg ? new Date(sinceArg + 'T00:00:00Z') : null;
  if (since && isNaN(since)) throw new Error('--since must be YYYY-MM-DD');

  let data;
  if (arg('--csv')) {
    const rows = parseCsv(fs.readFileSync(arg('--csv'), 'utf8'));
    if (rows.length < 2) throw new Error('empty CSV');
    data = fromMakeCsv(rows, since) || fromAbiturCsv(rows, since);
    if (!data) throw new Error('No raw-payload column and no Abitur columns (Unit, Ex1–Ex5) found.');
  } else if (arg('--stats')) {
    data = mergeStats([JSON.parse(fs.readFileSync(arg('--stats'), 'utf8'))]);
  } else if (process.argv.includes('--sheets')) {
    data = await fromSheets(since);
  } else {
    throw new Error('usage: node scripts/item-analysis.js --csv <file> | --sheets | --stats <file> [--min 15] [--json] [--since YYYY-MM-DD]');
  }

  const r = report(data, min);
  console.log(process.argv.includes('--json') ? JSON.stringify(r, null, 1) : printText(r));
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, 'flagged=' + r.flagged + '\n');
}

module.exports = { newUnit, addSubmission, finishUnit, mergeStats, report, discrimination };

if (require.main === module) {
  main().catch(e => { console.error(e.message); process.exit(2); });
}
