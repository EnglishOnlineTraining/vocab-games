/*
 * review-core.js — the marking logic, shared by the CLI and the browser tool.
 *
 * Pure functions only: no fs, no vm, no DOM. Everything that touches a file or
 * a test page lives in scripts/review-test.js; everything that decides a mark
 * lives here, so the script and the browser tool cannot drift apart and mark
 * the same paper differently.
 *
 * Loaded by Node with require(), and by the browser as a plain <script> that
 * defines window.EOLReview.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.EOLReview = factory();
}(typeof self !== 'undefined' ? self : this, function () {
'use strict';
/* ───────────────────────── text helpers ───────────────────────── */

// Answers are compared the way the page compares them, plus the tolerances the
// teacher has approved. `norm` is the page's own normalisation (see vnorm in the
// vocab tests): curly quotes folded, case and outer punctuation dropped.
function norm(s) {
  return String(s == null ? '' : s)
    .replace(/[‘’ʼ´`]/g, "'")
    .toLowerCase()
    .replace(/[.,!?;:]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function fold(s) {
  return norm(s).replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 'ss');
}

function lev(a, b) {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}

// Longest-first, so "ation" is tried before "ion" and "tion".
const SUFFIXES = [
  'ation', 'ibility', 'ability', 'ically', 'ically', 'ement', 'ance', 'ence', 'ship', 'hood',
  'ness', 'ment', 'tion', 'sion', 'ible', 'able', 'ious', 'less', 'ful', 'ing', 'ity',
  'ive', 'ist', 'ism', 'ial', 'est', 'ies', 'ly', 'al', 'ic', 'er', 'ty', 'es', 'ed', 's', 'y',
];

// A crude stem, deliberately: it only has to tell "safe/safety",
// "survive/survival" and "dead/deadly" apart from two unrelated words.
function stem(w) {
  let s = fold(w).replace(/^to be /, '').replace(/^to /, '');
  let changed = true;
  while (changed) {
    changed = false;
    for (const suf of SUFFIXES) {
      if (s.length - suf.length >= 3 && s.endsWith(suf)) {
        s = s.slice(0, -suf.length);
        changed = true;
        break;
      }
    }
  }
  return s.replace(/e$/, '');
}

const PARTICLES = ['off', 'out', 'up', 'around', 'away', 'on', 'in', 'over', 'back', 'down', 'through'];

function stripLead(s) {
  return fold(s).replace(/^to be /, '').replace(/^to /, '').replace(/^(a|an|the) /, '');
}

/*
 * Why a wrong answer is wrong. The categories exist because they carry different
 * marks: a dropped particle, a wrong word class and a misspelling all show the
 * student knew the word, while a different word entirely shows they did not.
 */
function classify(given, expected, otherTerms) {
  const g = norm(given), e = norm(expected);
  if (!g || g === '(blank)') return 'blank';
  if (g === e || fold(g) === fold(e)) return 'correct';

  // The word is right but the infinitive marker is missing ("likely" for "to be likely").
  if (stripLead(g) === stripLead(e)) return 'infinitive';

  /*
   * From here on the comparison is on the lead-stripped forms. "to gleam" is
   * eight characters, of which three carry no meaning, and leaving them in made
   * the length-scaled spelling rule far too generous: "to glow" and "to gleam"
   * came out as a misspelling while "glam" and "to gleam" did not. Stripping
   * "to"/"to be"/an article first puts both judgements right.
   */
  const cg = stripLead(g), ce = stripLead(e);
  const gt = cg.split(' '), et = ce.split(' ');

  // Same phrase, wrong or near-miss particle: "to call of" for "to call off".
  if (gt.length === et.length && gt.slice(0, -1).join(' ') === et.slice(0, -1).join(' ')
      && PARTICLES.includes(et[et.length - 1]) && lev(gt[gt.length - 1], et[et.length - 1]) <= 2) {
    return 'particle';
  }
  // A particle dropped or added outright: "to go" for "to go off".
  const drop = t => t.filter(w => !PARTICLES.includes(w));
  if (drop(gt).join(' ') === drop(et).join(' ') && drop(gt).length) return 'particle';

  // Same root, wrong part of speech: "safe" for "safety", "survive" for "survival".
  // The stems need not match exactly — stripping "ive" from "survive" and "al"
  // from "survival" leaves "surv" and "surviv" — so a short stem that prefixes
  // the longer one counts too.
  const sg = stem(cg), se = stem(ce);
  if (sg && se && sg === se && se.length >= 3) return 'word-class';
  const [shortS, longS] = sg.length <= se.length ? [sg, se] : [se, sg];
  if (shortS.length >= 4 && longS.length - shortS.length <= 3 && longS.startsWith(shortS)) return 'word-class';

  // A different word from the same list — a guess, not a slip.
  if (otherTerms && otherTerms.some(t => fold(t) === fold(g))) return 'wrong-word';

  /*
   * Spelling has to be judged against the word's length. Allowing two edits
   * flat made "trail" a misspelling of "track" — five letters, two of them
   * different, which is a different word. Short words get one edit, or any
   * number if the letters are merely in the wrong order ("snkae" for "snake").
   */
  // Compound spacing is not a spelling error worth its own category: "sea shell"
  // and "box jelly fish" are compared with the spaces closed up.
  const fg = cg.replace(/[\s']/g, ''), fe = ce.replace(/[\s']/g, '');
  const d = lev(fg, fe);
  const sorted = x => x.split('').sort().join('');
  const limit = fe.length <= 5 ? 1 : Math.max(2, Math.ceil(fe.length * 0.34));
  if (sorted(fg) === sorted(fe)) return 'spelling';
  // Same first letter, or few enough edits that a dropped opening syllable
  // ("rambulance" for "air ambulance") still reads as one word badly spelled.
  if (d <= limit && (fg[0] === fe[0] || d <= Math.ceil(fe.length * 0.2))) return 'spelling';
  return 'wrong-word';
}

// Part of the expected phrase is there: a token in common, or the whole answer
// is one of its words. Not a mark, just a reason to look.
function sharesWords(given, expected) {
  const g = stripLead(given).split(/[\s']+/).filter(w => w.length > 2);
  const e = stripLead(expected).split(/[\s']+/).filter(w => w.length > 2);
  if (!g.length || e.length < 2) return false;
  return g.some(w => e.indexOf(w) !== -1);
}

const HALF_DEFAULT = ['particle', 'word-class', 'spelling', 'infinitive'];

/* ───────────────────────── reading the rows ───────────────────────── */

// One small parser for all three shapes Excel and SWOP produce: tab-separated
// (what a paste gives you), semicolon (German Excel, the SWOP export) and comma.
function splitDelimited(text, delim) {
  const rows = [];
  let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; } else q = false;
      } else cell += c;
    } else if (c === '"') q = true;
    else if (c === delim) { row.push(cell); cell = ''; }
    else if (c === '\r') { /* ignore */ }
    else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
    else cell += c;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows.filter(r => r.some(c => String(c).trim() !== ''));
}

function sniffDelim(text) {
  const line = text.split('\n')[0] || '';
  if (line.indexOf('\t') !== -1) return '\t';
  const semi = (line.match(/;/g) || []).length, comma = (line.match(/,/g) || []).length;
  return semi > comma ? ';' : ',';
}

/*
 * Each Make row carries the complete raw payload in its last answer column
 * (see "the last answer column is now a raw backstop" in CLAUDE.md). That is the
 * authoritative copy, so prefer it over the individual columns whenever it is
 * there — the readable columns can be reordered or truncated by Excel, the JSON
 * cannot.
 */
function payloadFromCells(cells) {
  for (const c of cells) {
    const s = String(c || '').trim();
    if (s.length > 20 && s[0] === '{' && s.indexOf('"unit"') !== -1) {
      try {
        const o = JSON.parse(s);
        if (o && o.unit) return o;
      } catch (e) { /* not this cell */ }
    }
  }
  return null;
}

function rowsToPayloads(table) {
  const out = [];
  const first = table[0] || [];
  const looksHeader = first.some(c => /^(timestamp|name|class|unit)$/i.test(String(c).trim()));
  const header = looksHeader ? first.map(c => String(c).trim()) : null;
  const body = looksHeader ? table.slice(1) : table;

  body.forEach((cells, i) => {
    const p = payloadFromCells(cells);
    if (p) { out.push({ line: i + 1, payload: p, cells }); return; }
    // No raw payload in the row — rebuild one from the named columns.
    const rec = {};
    cells.forEach((v, j) => {
      const h = header ? header[j] : 'col' + (j + 1);
      if (!h) return;
      const k = h.toLowerCase();
      if (k === 'name') rec.name = v;
      else if (k === 'class' || k === 'cls' || k === 'group') rec.cls = v;
      else if (k === 'unit') rec.unit = v;
      else if (k === 'score') rec.score = v;
      else if (k === 'grade') rec.grade = v;
      else if (/^ex\s*\d+$/i.test(h)) rec[h.toLowerCase().replace(/\s+/g, '')] = v;
      else if (k === 'timestamp') rec.timestamp = v;
    });
    out.push({ line: i + 1, payload: rec, cells });
  });
  return out;
}
/* ───────────────────────── items out of one row ───────────────────────── */

/*
 * Three payload dialects are in the corpus, and the difference matters:
 *
 *  self   the vocab tests write "A <definition> -> <given> [wrong: <term>]", so
 *         the row states its own expected answer and no key is needed.
 *  flat   9ab / 9g-class-test write "1: given | 2: given" and the key lives in
 *         the page as S1_KEY, S3A_KEY …
 *  pool   10a writes "1. [q7 (be)] given | …" because each student gets a
 *         different selection; the id points into S1_POOL.
 *
 * A section with no key is teacher-marked, which is exactly what the marking
 * sheet is built from.
 */
/*
 * A page's own answer comparison. These differ in ways that change the mark:
 * 9ab and 10a delete apostrophes together with the spaces around them, so
 * "doesn't hurry" and "doesnt hurry" are one answer to them; 9g-class-test
 * deletes only the apostrophe; the vocab tests keep it. Comparing with the
 * wrong one silently disagrees with the score the student was shown.
 *
 * Node reads the real function out of the page. The browser tool cannot, so it
 * carries a style name instead, and scripts/build-review-tool.js refuses to
 * build unless the named style and the page's own function agree on a set of
 * probe strings.
 */
const NORM_STYLES = {
  'apos-and-space': s => String(s == null ? '' : s).toLowerCase()
    .replace(/\s*[\u2018\u2019\u02BC'`\u00B4]\s*/g, '').replace(/\s+/g, ' ').trim(),
  'apos': s => String(s == null ? '' : s).toLowerCase()
    .replace(/['\u2019]/g, '').replace(/\s+/g, ' ').trim(),
};

function pageNormFn(page) {
  if (page && typeof page.norm === 'function') return page.norm;
  if (page && NORM_STYLES[page.normStyle]) return NORM_STYLES[page.normStyle];
  return norm;
}

const SELF_RE = /^([ABC])\s+(.*?)\s+->\s+([\s\S]*?)\s*\[(correct|wrong:\s*([\s\S]*?)|form ok, mark me|form check failed, mark me)\]$/;

function itemsFromRow(payload, page) {
  const items = [];
  const nrm = pageNormFn(page);
  const slotKeys = Object.keys(payload).filter(k => /^ex\d+$/.test(k))
    .sort((a, b) => Number(a.slice(2)) - Number(b.slice(2)));

  for (const slot of slotKeys) {
    const cell = String(payload[slot] || '').trim();
    if (!cell) continue;

    // Notes the page adds for the teacher, not answers.
    if (/^SECTION C is teacher-marked/.test(cell) || /^integrity\s*\|/.test(cell)
        || /^AUTO-GRADE\b/.test(cell) || /^INTEGRITY\b/.test(cell)) continue;

    const self = cell.match(SELF_RE);
    if (self) {
      const tag = self[4];
      items.push({
        section: self[1],
        prompt: self[2],
        given: self[3] === '(blank)' ? '' : self[3],
        expected: self[1] === 'C' ? self[2] : (self[5] != null ? self[5].trim() : self[2]),
        auto: tag === 'correct',
        teacherMarked: self[1] === 'C',
        formOk: /form ok/.test(tag),
      });
      continue;
    }

    const section = page && page.slots[slot];
    if (!section) continue;
    const keyVar = 'S' + section.replace(/^s/, '').toUpperCase() + '_KEY';
    const poolVar = 'S' + section.replace(/^s/, '').toUpperCase() + '_POOL';
    const key = page.keys[keyVar];
    const pool = page.pools[poolVar];

    cell.split(' | ').forEach(part => {
      const pooled = part.match(/^(\d+)\.\s*\[q(\d+)([^\]]*)\]\s*([\s\S]*)$/);
      if (pooled && pool) {
        const item = pool.find(it => String(it.id) === pooled[2]);
        const given = pooled[4] === '—' ? '' : pooled[4].trim();
        const accepts = item ? [].concat(item.key) : [];
        items.push({
          section, prompt: (item ? (item.before || '') + '___' + (item.after || '') : 'q' + pooled[2]).trim(),
          given, expected: accepts[0] || '', accepts,
          auto: accepts.some(k => nrm(k) === nrm(given)),
          teacherMarked: !accepts.length,
        });
        return;
      }
      const flat = part.match(/^([^:]+):\s*([\s\S]*)$/);
      if (!flat) return;
      const id = flat[1].trim();
      const given = flat[2] === '—' ? '' : flat[2].trim();
      const expected = key ? key[id] : undefined;
      items.push({
        section, prompt: id, given,
        expected: expected == null ? '' : String(expected),
        auto: expected != null && nrm(expected) === nrm(given),
        teacherMarked: expected == null,
      });
    });
  }
  return items;
}

/* ───────────────────────── marking ───────────────────────── */

function markItem(item, policy, otherTerms, strict) {
  if (item.teacherMarked) return Object.assign({}, item, { points: null, why: 'teacher' });
  const per = policy.pointsEach;
  if (item.auto) return Object.assign({}, item, { points: per, why: 'correct' });

  // An answer the teacher has decided to accept scores full marks, and is
  // reported so the decision stays visible rather than becoming invisible policy.
  const accepts = (policy.accept[item.expected] || []).map(norm);
  if (!strict && accepts.indexOf(norm(item.given)) !== -1) {
    return Object.assign({}, item, { points: per, why: 'accepted' });
  }

  const cat = classify(item.given, item.expected, otherTerms);
  if (cat === 'correct') return Object.assign({}, item, { points: per, why: 'correct' });
  const half = !strict && policy.half.indexOf(cat) !== -1;
  return Object.assign({}, item, {
    points: half ? per / 2 : 0,
    why: cat,
    // Zeroing an answer that is half right is the one call this script should
    // not make on its own: "shaped jellyfish" for "box jellyfish" gets part of
    // the compound, "own" for "on one's own" is a fragment of the phrase. They
    // are reported for a decision rather than quietly marked 0.
    secondLook: !half && cat === 'wrong-word' && sharesWords(item.given, item.expected),
  });
}

function rollMatch(typed, roll) {
  const t = fold(typed).replace(/[._,]/g, ' ').replace(/\s+/g, ' ').trim();
  const hits = roll.filter(r => {
    const last = fold(r.last), firsts = fold(r.first).split(' ').filter(Boolean);
    let lastOk = last && t.indexOf(last) !== -1;
    if (!lastOk) {
      // an abbreviated surname: "Finja t." for Thöne
      const tokens = t.split(' ');
      lastOk = !!last && tokens.some(w => w.length <= 2 && w[0] === last[0]);
    }
    if (!lastOk) return false;
    return firsts.some(f => f && t.indexOf(f) !== -1);
  });
  return hits.length === 1 ? hits[0] : null;
}

function surnameOf(name, roll) {
  const hit = roll.length ? rollMatch(name, roll) : null;
  if (hit) return hit.last;
  const parts = String(name).trim().split(/\s+/);
  return parts[parts.length - 1];
}

// The thresholds are read off the real table once, here, so the sheet in the
// browser cannot hold a second opinion of what Note 2 means.
function gradeLadder(total, lookupGrade) {
  const out = [];
  for (let i = 0; i <= total * 2; i++) {
    const pts = i / 2;
    const g = lookupGrade(pts, total);
    out.push([pts, g ? g.note : 0, g ? g.label : '']);
  }
  return out;
}

// The integrity slot is one string the page assembles; read it back into fields
// so the report can name the outliers rather than printing 26 raw lines.
function integrityOf(p) {
  const cell = Object.keys(p).map(k => String(p[k] || ''))
    .find(v => /^integrity\s*\|/.test(v) || /^INTEGRITY\b/.test(v)) || '';
  const num = re => { const m = cell.match(re); return m ? Number(m[1]) : null; };
  return {
    raw: cell,
    time: num(/time[= ](\d+)s/) || (() => { const m = cell.match(/time=(\d+)m(\d+)s/); return m ? Number(m[1]) * 60 + Number(m[2]) : null; })(),
    tabs: num(/tab[- _]switches[= ](\d+)/),
    paste: num(/paste(?:_attempts)?[= ](\d+)/),
    typing: num(/typing(?:_anomalies)?[= ](\d+)/),
    devtools: /devtools[= ](true|1)/.test(cell),
    reloads: num(/reloads[= ](\d+)/),
  };
}

/* ───────────────────────── the report ───────────────────────── */

function fmt(n) { return Number.isInteger(n) ? String(n) : n.toFixed(1); }

function report(r) {
  const L = [];
  const { policy, roll, lookupGrade } = r;
  const all = r.subs;
  const subs = all.filter(s => !s.duplicateOf);
  const autoMax = subs.length ? subs[0].autoMax : 0;
  const teacherMax = subs.length ? subs[0].teacherMax : 0;
  const total = autoMax + teacherMax;

  L.push('# ' + r.unit + ' — ' + subs.length + ' submission' + (subs.length === 1 ? '' : 's'));
  if (r.mixed.length > 1) L.push('', '**More than one unit in these rows:** ' + r.mixed.join(', ') + ' — filter the paste first.');
  L.push('', 'Marked out of ' + autoMax + ' automatic' + (teacherMax ? ' + ' + teacherMax + ' teacher-marked = ' + total : '') + '.');
  if (!r.page) L.push('', '**The test page was not found**, so nothing could be re-marked — only the rows are summarised.');
  L.push(r.strict
    ? 'Scored exactly as the page scored it (`--strict`).'
    : 'Half credit for ' + policy.half.join(', ') + '; nothing for blank or wrong-word.'
      + (Object.keys(policy.accept).length ? ' ' + Object.keys(policy.accept).length + ' accept rule(s) applied.' : ''));

  /* attendance */
  if (roll.length) {
    const matched = new Set(all.map(s => s.roll && s.roll.nr).filter(Boolean));
    const missing = roll.filter(s => !matched.has(s.nr));
    const unknown = all.filter(s => !s.roll);
    L.push('', '## Attendance', '', roll.length + ' on the class list, ' + matched.size + ' matched.');
    if (missing.length) {
      L.push('', 'No submission (' + missing.length + '):');
      missing.forEach(m => L.push('- ' + m.nr + '. ' + m.first + ' ' + m.last));
    }
    if (unknown.length) {
      L.push('', 'Submitted but not matched to the list (' + unknown.length + '):');
      unknown.forEach(u => L.push('- "' + u.typed + '" (row ' + u.line + ')'));
    }
  }

  /* duplicates */
  const dupes = [...new Set(all.filter(s => s.duplicates).map(s => s.duplicates))];
  if (dupes.length) {
    L.push('', '## Submitted more than once', '',
      'The dedup key is class + name + unit + day, so a stray space in the class field defeats it. '
      + 'Counting the ' + (r.keepLast ? 'last' : 'first') + ' attempt; the ' + (r.keepLast ? 'earlier' : 'later')
      + ' ones are left out of everything below.' + (r.keepLast ? '' : ' Use `--keep-last` to swap that.'), '');
    dupes.forEach(v => L.push('- ' + v[0].name + ': ' + v.map(s => 'row ' + s.line + ' — ' + fmt(s.points) + '/'
      + s.autoMax + ' (class "' + s.cls + '")' + (s.duplicateOf ? ' — not counted' : ' — counted')).join(', ')));
  }

  /* per section */
  const sections = [...new Set(subs.flatMap(s => s.items.map(i => i.section)))];
  L.push('', '## Sections', '', '| Section | Answers | Correct | Points | Teacher-marked |', '|---|---|---|---|---|');
  sections.forEach(sec => {
    const all = subs.flatMap(s => s.items.filter(i => i.section === sec));
    if (!all.length) return;
    const tm = all[0].teacherMarked;
    const ok = all.filter(i => i.why === 'correct' || i.why === 'accepted').length;
    const pts = all.reduce((s, i) => s + (i.points || 0), 0);
    const max = all.length * policy.pointsEach;
    L.push('| ' + sec + ' | ' + all.length + ' | ' + (tm ? '—' : ok + ' (' + Math.round(100 * ok / all.length) + '%)')
      + ' | ' + (tm ? '—' : fmt(pts) + ' / ' + max + ' (' + Math.round(100 * pts / max) + '%)') + ' | ' + (tm ? 'yes' : 'no') + ' |');
  });

  /* why the wrong ones were wrong */
  const wrong = subs.flatMap(s => s.items.filter(i => !i.teacherMarked && i.why !== 'correct' && i.why !== 'accepted')
    .map(i => Object.assign({ who: s.name }, i)));
  if (wrong.length) {
    const byCat = {};
    wrong.forEach(w => (byCat[w.why] = byCat[w.why] || []).push(w));
    L.push('', '## Why the wrong answers were wrong', '', '| Type | Count | Marks each |', '|---|---|---|');
    Object.keys(byCat).sort((a, b) => byCat[b].length - byCat[a].length).forEach(c => {
      const half = !r.strict && policy.half.indexOf(c) !== -1;
      L.push('| ' + c + ' | ' + byCat[c].length + ' | ' + (half ? fmt(policy.pointsEach / 2) : '0') + ' |');
    });
    Object.keys(byCat).sort((a, b) => byCat[b].length - byCat[a].length).forEach(c => {
      L.push('', '**' + c + '** (' + byCat[c].length + ')');
      byCat[c].slice(0, 40).forEach(w => L.push('- ' + w.who + (w.given ? ': wrote "' + w.given + '"' : ': left blank') + ' for **' + w.expected + '**'));
      if (byCat[c].length > 40) L.push('- … and ' + (byCat[c].length - 40) + ' more');
    });
  }

  /* answers that are part-right */
  const look = subs.flatMap(s => s.items.filter(i => i.secondLook).map(i => Object.assign({ who: s.name }, i)));
  if (look.length) {
    L.push('', '## Worth a second look', '',
      'Marked 0 as the wrong word, but part of the expected answer is there. Decide each one, '
      + 'then add it to `data/test-marking/' + r.unit + '.json` so the next sitting marks it the same way.', '');
    look.forEach(w => L.push('- ' + w.who + ': wrote "' + w.given + '" for **' + w.expected + '**'));
  }

  /* the words the class could not produce */
  const perTerm = {};
  subs.forEach(s => s.items.filter(i => !i.teacherMarked).forEach(i => {
    const t = perTerm[i.expected] = perTerm[i.expected] || { asked: 0, got: 0 };
    t.asked++; if (i.why === 'correct' || i.why === 'accepted') t.got++;
  }));
  const hardest = Object.entries(perTerm).filter(([, v]) => v.asked >= 2 && v.got / v.asked < 0.6)
    .sort((a, b) => a[1].got / a[1].asked - b[1].got / b[1].asked);
  if (hardest.length) {
    L.push('', '## Worth reteaching', '', 'Answered correctly by fewer than 60%, asked at least twice:', '');
    hardest.slice(0, 25).forEach(([t, v]) => L.push('- **' + t + '** — ' + v.got + ' / ' + v.asked));
  }

  /* integrity */
  const flagged = subs.filter(s => s.integrity.raw);
  if (flagged.length) {
    const med = arr => { const a = arr.filter(x => x != null).sort((x, y) => x - y); return a.length ? a[Math.floor(a.length / 2)] : null; };
    const medTabs = med(flagged.map(s => s.integrity.tabs));
    const out = flagged.filter(s => (s.integrity.tabs || 0) > Math.max(4, (medTabs || 0) * 3) || (s.integrity.paste || 0) > 0);
    L.push('', '## Integrity', '', 'Median tab switches: ' + medTabs + '.');
    if (out.length) {
      L.push('', 'Worth a look:');
      out.forEach(s => L.push('- ' + s.name + ': ' + s.integrity.tabs + ' tab switches, '
        + s.integrity.paste + ' paste attempt(s), ' + Math.round((s.integrity.time || 0) / 60) + ' min'));
    } else L.push('', 'Nothing stands out.');
    if (policy.ignoreFlags.length) L.push('', 'Ignored by policy: ' + policy.ignoreFlags.join(', ') + '.');
  }

  /* the table */
  L.push('', '## Scores, by surname', '', '| # | Student | Class | Auto' + (teacherMax ? ' (of ' + autoMax + ')' : '')
    + ' | Page said | ' + (teacherMax ? 'Still to mark |' : 'Note |'), '|---|---|---|---|---|---|');
  subs.forEach((s, i) => {
    const g = lookupGrade(s.points, s.autoMax);
    const mismatch = reportedMismatch(s);
    L.push('| ' + (i + 1) + ' | ' + s.name + ' | ' + s.cls + ' | ' + fmt(s.points) + ' / ' + s.autoMax
      + ' | ' + (s.reported || '—') + (mismatch ? ' ⚠' : '') + ' | '
      + (teacherMax ? s.teacher.length + ' answers' : (g ? 'Note ' + g.note + ' (' + g.label + ')' : '—')) + ' |');
  });
  const bad = subs.filter(reportedMismatch);
  if (bad.length) {
    L.push('', '⚠ The re-mark and the page disagree for ' + bad.length + ' student(s) beyond the half-credit rules — '
      + 'check the answer key before trusting either number: ' + bad.map(s => s.name).join(', ') + '.');
  }
  return L.join('\n');
}

// The page put its own score in the row. Recomputing must land on it (or above
// it, where half credit was granted); anything else means the key this script
// read is not the key the page used, and that must be said out loud, not hidden.
function reportedMismatch(s) {
  const m = String(s.reported).match(/^\s*([\d.]+)\s*\/\s*(\d+)/);
  if (!m) return false;
  const pageScore = Number(m[1]);
  const raw = s.auto.filter(i => i.why === 'correct').length;
  return raw !== pageScore;
}
// Things the teacher should see beside a name while marking.
function flagsFor(s) {
  const f = [];
  if (s.teacher.length && s.teacher.every(i => !i.given)) f.push('nothing written');
  else if (s.teacher.some(i => !i.given)) f.push(s.teacher.filter(i => !i.given).length + ' blank');
  if (s.teacher.some(i => i.formOk === false)) f.push(s.teacher.filter(i => i.formOk === false).length + ' failed the form check');
  if ((s.integrity.paste || 0) > 0) f.push('paste attempt');
  return f;
}

/* ───────────────────────── the grade table ───────────────────────── */

// Built from the table itself rather than hard-coded thresholds. Node reads the
// table out of exercise.js; the browser tool is handed the same arrays at build
// time. Both floor at Note 5, which is what every page does.
function makeGradeLookup(TABLE, LABELS) {
  return function lookupGrade(earned, possible) {
    if (!possible) return null;
    let score, maxPts;
    if (possible < 10) { maxPts = 10; score = Math.round(earned / possible * 10); }
    else if (possible > 100) { maxPts = 100; score = Math.round(earned / possible * 100); }
    else { maxPts = possible; score = earned; }
    score = Math.max(0, Math.min(maxPts, score));
    const row = TABLE.filter(r => r[0] === maxPts)[0];
    if (!row) return null;
    for (let i = 1; i <= 5; i++) if (score >= row[i]) return { note: i, label: LABELS[i - 1] };
    return { note: 5, label: LABELS[4] };
  };
}

/* ───────────────────────── the review ───────────────────────── */

/*
 * Everything above, applied to one sitting. The caller supplies the parsed
 * table, the class list, the page (answer keys) and the policy — where those
 * come from is the caller's problem, which is what lets the same function serve
 * a CLI reading files and a page reading a paste.
 */
function analyse(opts) {
  const table = opts.table;
  const roll = opts.roll || [];
  const page = opts.page || null;
  const policy = opts.policy;
  const strict = !!opts.strict;
  const rows = rowsToPayloads(table);
  if (!rows.length) throw new Error('no rows found — paste the whole table, header row included');

  const unit = rows.map(r => r.payload.unit).filter(Boolean)[0];
  if (!unit) throw new Error('no unit column and no raw payload — cannot tell which test this is');
  const mixed = [...new Set(rows.map(r => r.payload.unit).filter(Boolean))];

  const bank = page && page.bank ? page.bank : [];

  const subs = rows.map(r => {
    const p = r.payload;
    const items = itemsFromRow(p, page).map(it => markItem(it, policy, bank, strict));
    const auto = items.filter(it => !it.teacherMarked);
    const teacher = items.filter(it => it.teacherMarked);
    const hit = roll.length ? rollMatch(p.name || '', roll) : null;
    return {
      line: r.line,
      typed: String(p.name || '').trim(),
      name: hit ? hit.first + ' ' + hit.last : String(p.name || '').trim(),
      surname: surnameOf(p.name || '', roll),
      cls: String(p.cls || '').trim(),
      roll: hit,
      reported: String(p.score || '').trim(),
      reportedGrade: String(p.grade || '').trim(),
      integrity: integrityOf(p),
      items, auto, teacher,
      points: auto.reduce((s, it) => s + it.points, 0),
      autoMax: auto.length * policy.pointsEach,
      teacherMax: teacher.length * policy.teacherPointsEach,
    };
  });

  /*
   * A student who sits the test twice in a day should appear once. The dedup key
   * in Make is class + name + unit + day, so a stray space in the class field
   * ("9b" then "9 b") lets a second attempt through — it happened. The first
   * attempt counts unless keepLast says otherwise; the later ones stay in the
   * report under "Submitted more than once" but are kept out of the section
   * stats, the marking sheet and the score table.
   */
  const byStudent = {};
  subs.forEach(s => {
    const k = s.roll ? 'nr' + s.roll.nr : fold(s.typed);
    (byStudent[k] = byStudent[k] || []).push(s);
  });
  Object.keys(byStudent).forEach(k => {
    const list = byStudent[k];
    if (list.length < 2) return;
    list.sort((a, b) => a.line - b.line);
    const keep = opts.keepLast ? list[list.length - 1] : list[0];
    list.forEach(s => { s.duplicates = list; if (s !== keep) s.duplicateOf = keep; });
  });

  subs.sort((a, b) => a.surname.localeCompare(b.surname, 'de') || a.name.localeCompare(b.name, 'de') || a.line - b.line);
  return { unit, mixed, page, policy, roll, subs, lookupGrade: opts.lookupGrade, strict, keepLast: !!opts.keepLast };
}

/* ───────────────────────── the class list ───────────────────────── */

// A SWOP export (Nr;Nachname;Vorname), already split into rows.
function rollFromTable(table) {
  const head = (table[0] || []).map(c => String(c).toLowerCase().trim());
  const iLast = head.findIndex(h => /nachname|surname|last/.test(h));
  const iFirst = head.findIndex(h => /vorname|forename|first/.test(h));
  const iNr = head.findIndex(h => /^nr\.?$/.test(h));
  const body = (iLast !== -1 || iFirst !== -1) ? table.slice(1) : table;
  return body.map((r, i) => ({
    nr: iNr !== -1 ? String(r[iNr] || '').trim() : String(i + 1),
    last: String(r[iLast !== -1 ? iLast : 1] || '').trim(),
    first: String(r[iFirst !== -1 ? iFirst : 2] || '').trim(),
  })).filter(s => s.last || s.first);
}

const DEFAULT_POLICY = {
  pointsEach: 1, teacherPointsEach: 2, half: HALF_DEFAULT.slice(),
  accept: {}, ignoreFlags: [], notes: '',
};

return {
  norm, fold, lev, stem, stripLead, classify, sharesWords, HALF_DEFAULT, DEFAULT_POLICY,
  splitDelimited, sniffDelim, rowsToPayloads, payloadFromCells,
  itemsFromRow, markItem, rollMatch, rollFromTable, surnameOf, integrityOf,
  makeGradeLookup, gradeLadder, analyse, report, fmt, flagsFor, NORM_STYLES, pageNormFn,
};
}));
