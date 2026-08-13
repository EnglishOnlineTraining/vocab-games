/*
 * extract-graded.js — helper for the `add-explanations` skill.
 *
 *   node scripts/extract-graded.js <file.html> …   dump each page's UNIT and, per
 *       graded checkDropdowns/checkDropdownsMulti call, the scoreKey, prefix and
 *       every gap's question stem + options + correct answer. Raw material for
 *       writing the `why` lines that go into data/explanations.json.
 *
 *   node scripts/extract-graded.js --todo           list the rollout backlog:
 *       framework pages with graded gaps but no entry (by UNIT) in
 *       data/explanations.json, plus pages whose grading uses a bespoke checker
 *       (no standard call found → author by hand).
 *
 * Handles answers/ids passed either inline ({…}/[…]) or as a variable
 * (`answers`, `ANSWERS.A`, `FIELDS.A`), resolving the nearest definition.
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

function decode(s) {
  return s.replace(/&rsquo;|&#8217;/g, '’').replace(/&lsquo;/g, '‘').replace(/&amp;/g, '&')
          .replace(/&ldquo;/g, '“').replace(/&rdquo;/g, '”').replace(/&mdash;/g, '—')
          .replace(/&ndash;/g, '–').replace(/&nbsp;/g, ' ').replace(/&hellip;/g, '…')
          .replace(/&rarr;/g, '→').replace(/&#39;/g, "'").replace(/&quot;/g, '"')
          .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}
function unitOf(src) { return (src.match(/var\s+UNIT\s*=\s*['"]([^'"]+)['"]/) || [])[1] || ''; }

/* index of the bracket matching the opener at src[i], quote-aware */
function matchBracket(src, i) {
  var open = src[i], close = { '(': ')', '[': ']', '{': '}' }[open];
  var depth = 0, inStr = false, q = '', esc = false;
  for (var j = i; j < src.length; j++) {
    var c = src[j];
    if (inStr) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === q) inStr = false; continue; }
    if (c === "'" || c === '"') { inStr = true; q = c; continue; }
    if (c === open) depth++;
    else if (c === close) { depth--; if (depth === 0) return j; }
  }
  return -1;
}

/* split a call's inner arg string on top-level commas */
function splitArgs(inner) {
  var args = [], depth = 0, inStr = false, q = '', esc = false, cur = '';
  for (var i = 0; i < inner.length; i++) {
    var c = inner[i];
    if (inStr) { cur += c; if (esc) esc = false; else if (c === '\\') esc = true; else if (c === q) inStr = false; continue; }
    if (c === "'" || c === '"') { inStr = true; q = c; cur += c; continue; }
    if (c === '(' || c === '[' || c === '{') depth++;
    else if (c === ')' || c === ']' || c === '}') depth--;
    if (c === ',' && depth === 0) { args.push(cur.trim()); cur = ''; } else cur += c;
  }
  if (cur.trim()) args.push(cur.trim());
  return args;
}

/* resolve an expression (inline literal or `name`/`name.key`) to a JS value */
function resolveExpr(src, expr, fromIdx) {
  expr = expr.trim();
  if (expr[0] === '[' || expr[0] === '{') { try { return eval('(' + expr + ')'); } catch (e) { return null; } }
  var m = expr.match(/^([A-Za-z_$][\w$]*)(?:\.([A-Za-z_$][\w$]*))?$/);
  if (!m) return null;
  var base = m[1], key = m[2];
  var re = new RegExp('\\bvar\\s+' + base + '\\s*=\\s*', 'g'), mm, at = -1;
  while ((mm = re.exec(src))) { var pos = mm.index + mm[0].length; if (fromIdx == null || mm.index < fromIdx) at = pos; else if (at < 0) at = pos; }
  if (at < 0) return null;
  while (at < src.length && src[at] !== '{' && src[at] !== '[') at++;
  var end = matchBracket(src, at);
  if (end < 0) return null;
  var val; try { val = eval('(' + src.slice(at, end + 1) + ')'); } catch (e) { return null; }
  return key ? (val ? val[key] : null) : val;
}

/* all graded checkDropdowns/Multi calls with resolved ids + answers */
function gradedCalls(src) {
  var out = [], re = /checkDropdowns(Multi)?\s*\(/g, m;
  while ((m = re.exec(src))) {
    var paren = src.indexOf('(', m.index);
    var endP = matchBracket(src, paren);
    if (endP < 0) continue;
    var args = splitArgs(src.slice(paren + 1, endP));
    if (args.length < 5) continue;                       // needs a scoreKey (5th arg)
    var scoreKey = (args[4].match(/^['"]([^'"]+)['"]$/) || [])[1];
    var prefix = (args[1].match(/^['"]([^'"]*)['"]$/) || [null, ''])[1];
    if (!scoreKey) continue;
    var ids = resolveExpr(src, args[0], m.index) || [];
    var answers = resolveExpr(src, args[2], m.index) || {};
    out.push({ multi: !!m[1], ids: ids, prefix: prefix, answers: answers, scoreKey: scoreKey });
  }
  return out;
}

/* One gap's stem, trailing context, options and answer — the raw material both
   the CLI dump and build-review-pages.js need. Returns null if the <select>
   named by the call is not in the file. */
function gapDetail(src, c, g) {
  var selIdx = src.indexOf('id="' + c.prefix + g + '"');
  if (selIdx === -1) return null;
  var pStart = src.lastIndexOf('<p', selIdx);
  var q = decode(src.slice(pStart === -1 ? Math.max(0, selIdx - 160) : pStart, selIdx)).slice(-140);
  var selEnd = src.indexOf('</select>', selIdx);
  var after = selEnd === -1 ? '' : decode(src.slice(selEnd + 9, selEnd + 160)).slice(0, 70);
  var opts = [], pairs = [], block = selEnd === -1 ? '' : src.slice(selIdx, selEnd), om;
  var ore = /<option[^>]*value="([^"]*)"[^>]*>([\s\S]*?)<\/option>/g;
  while ((om = ore.exec(block))) {
    if (!om[1]) continue;                       // the "— choose —" placeholder
    opts.push(om[1]);
    pairs.push({ value: om[1], text: decode(om[2]) || om[1] });
  }
  if (!opts.length) {
    var o2, r2 = /<option>([^<]+)<\/option>/g;
    while ((o2 = r2.exec(block))) { var t = o2[1].trim(); opts.push(t); pairs.push({ value: t, text: t }); }
  }
  // Some series (the it-* pages) use letter-coded values — value="a" with the
  // real wording in the option text — so callers that need readable content
  // must use `pairs`, not `opts`.
  return { id: g, q: q, after: after, opts: opts, pairs: pairs, answer: c.answers[g] };
}

function dumpPage(f) {
  var src = fs.readFileSync(path.join(ROOT, f), 'utf8');
  console.log('\n========== ' + f + '  (UNIT: ' + (unitOf(src) || '?') + ') ==========');
  var calls = gradedCalls(src);
  if (!calls.length) { console.log('  (no standard graded call found — bespoke or free-text)'); return; }
  calls.forEach(function (c) {
    console.log('\n--- scoreKey=' + c.scoreKey + "  prefix='" + c.prefix + "'" + (c.multi ? '  (multi-answer)' : '') + ' ---');
    c.ids.forEach(function (g) {
      var ans = JSON.stringify(c.answers[g]);
      var d = gapDetail(src, c, g);
      if (!d) { console.log(g + ' [ans ' + ans + ']  (element not found)'); return; }
      console.log(g + ' [ans ' + ans + ']');
      console.log('   Q: …' + d.q);
      if (d.after) console.log('   …after: ' + d.after);
      console.log('   opts: ' + d.opts.join(' | '));
    });
  });
}

function todo() {
  var explPath = path.join(ROOT, 'data', 'explanations.json');
  var have = fs.existsSync(explPath) ? JSON.parse(fs.readFileSync(explPath, 'utf8')) : {};
  var files = fs.readdirSync(ROOT).filter(function (f) { return f.endsWith('.html'); }).sort();
  var backlog = [], done = [], manual = [];
  files.forEach(function (f) {
    if (/activities\.html$/.test(f) || /^_/.test(f) || /^lead-/.test(f)) return;
    var src = fs.readFileSync(path.join(ROOT, f), 'utf8');
    if (!/exercise\.js/.test(src)) return;
    var unit = unitOf(src);
    var calls = gradedCalls(src);
    if (calls.length) {
      // A page may carry its own explanations inline; exercise.js prefers an
      // inline EXPLAIN over the data file, so it is done, not outstanding.
      // The generated *-review.html pages are all of this kind.
      var inlineExplain = /\bvar\s+EXPLAIN\s*=/.test(src);
      if ((unit && have[unit]) || inlineExplain) done.push(f);
      else backlog.push({ f: f, unit: unit, gaps: calls.reduce(function (s, c) { return s + c.ids.length; }, 0) });
    } else if (/state\.scores\s*\[|\bscoreKey\b|checkDropdowns/.test(src)) {
      manual.push(f);
    }
  });
  console.log('EXPLANATIONS BACKLOG — ' + backlog.length + ' pages need entries (extractable):\n');
  backlog.forEach(function (b) { console.log('  ' + b.f.padEnd(34) + 'UNIT=' + (b.unit || '?').padEnd(28) + b.gaps + ' gaps'); });
  console.log('\nDONE — ' + done.length + ' pages already have explanations.');
  console.log('\nMANUAL (bespoke checker, no standard call) — ' + manual.length + ':');
  manual.forEach(function (f) { console.log('  ' + f); });
}

/* Reused by scripts/build-review-pages.js — keep these signatures stable. */
module.exports = { decode: decode, unitOf: unitOf, gradedCalls: gradedCalls, gapDetail: gapDetail };

if (require.main === module) {
  var args = process.argv.slice(2);
  if (!args.length) { console.error('usage: node scripts/extract-graded.js <file.html> … | --todo'); process.exit(2); }
  if (args[0] === '--todo') todo();
  else args.forEach(dumpPage);
}
