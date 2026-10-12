/*
 * test-abitur-parse.js — self-check for the Abitur marker's row parser.
 * Run with: node test-abitur-parse.js
 *
 * The marker (scripts/abitur-marker.html, built by
 * scripts/build-abitur-marker.js) takes rows pasted straight out of the
 * abitursubs sheet. Essays are free text in column 11, so they carry tabs,
 * newlines and quotation marks, and a parser that mishandles any of those
 * silently merges rows and drops students. A paste of 25 rows once came out
 * as 20 because an essay quoted a text title and left the quote unbalanced.
 *
 * No real submissions here: every name below is made up.
 */
var fs = require('fs');
var assert = require('assert');

/* Lift the page's own parser rather than re-implementing it. */
var html = fs.readFileSync(__dirname + '/scripts/abitur-marker.html', 'utf8');
function lift(re, what) {
  var m = html.match(re);
  if (!m) throw new Error('could not find ' + what + ' in scripts/abitur-marker.html');
  return m[0];
}
var src = lift(/function splitDelimited[\s\S]*?\n}\n/, 'splitDelimited()')
  + lift(/function sniffDelim[\s\S]*?\n}\n/, 'sniffDelim()')
  + lift(/var COLS = \[[\s\S]*?\n}\n/, 'COLS / rowsToStudents()')
  + '\nmodule.exports = { splitDelimited: splitDelimited, sniffDelim: sniffDelim, rowsToStudents: rowsToStudents };';
var mod = { exports: {} };
new Function('module', src)(mod);
var splitDelimited = mod.exports.splitDelimited;
var sniffDelim = mod.exports.sniffDelim;
var rowsToStudents = mod.exports.rowsToStudents;

var HEAD = ['Timestamp', 'Name', 'Class', 'Unit', 'Ex1', 'Ex2', 'Ex3', 'Ex4', 'Ex5', 'Score', 'Essay', 'Feedback'];
function row(name, essay) {
  return ['2026-10-12', name, '10a', 'abitur-text-analysis-demo',
    "'4/4", "'3/4", "'2/2", "'5/5", "'ticked", "'14/15", essay, ''];
}
/* The sheet is tab-separated; a cell is quoted only when it has to be. */
function tsv(rows) {
  return rows.map(function (r) {
    return r.map(function (c) {
      return /[\t\n"]/.test(c) ? '"' + String(c).replace(/"/g, '""') + '"' : c;
    }).join('\t');
  }).join('\n') + '\n';
}
function parse(rows) {
  var text = tsv(rows);
  var table = splitDelimited(text, sniffDelim(text));
  table.forEach(function (r, i) {
    assert.strictEqual(r.length, 12, 'row ' + i + ' came out ' + r.length + ' cells wide, not 12');
  });
  return rowsToStudents(table).filter(function (s) { return s.name || s.essay; });
}
function words(s) { return (s.trim().match(/\S+/g) || []).length; }

/* ── 1. the regression: an unbalanced quote inside an UNQUOTED cell ──
   This is what students write. A quote that opens mid-cell used to swallow
   every following tab and newline, merging the rest of the paste into it. */
var unbalanced = 'The source is "Thrown Off the Train at Maritzburg from '
  + '"The Story of My Experiments with Truth (1927-29), an autobiography.';
var S = parse([HEAD, row('Ada One', unbalanced), row('Ben Two', 'Short and plain.'),
  row('Cleo Three', 'Also plain.'), row('Dan Four', 'And plain.')]);
assert.strictEqual(S.length, 4, 'an unbalanced quote lost rows: got ' + S.length + ' of 4');
assert.deepStrictEqual(S.map(function (s) { return s.name; }),
  ['Ada One', 'Ben Two', 'Cleo Three', 'Dan Four']);
assert.strictEqual(S[0].essay, unbalanced, 'the essay text was altered');
assert.strictEqual(words(S[1].essay), 3);

/* ── 2. a properly quoted cell with newlines still joins into one essay ── */
S = parse([HEAD, row('Ada One', 'First paragraph.\n\nSecond paragraph.'), row('Ben Two', 'Plain.')]);
assert.strictEqual(S.length, 2);
assert.ok(S[0].essay.indexOf('First paragraph.') === 0 && /Second paragraph\.$/.test(S[0].essay),
  'a quoted multi-line essay did not survive: ' + JSON.stringify(S[0].essay));
assert.strictEqual(S[1].essay, 'Plain.');

/* ── 3. a properly quoted cell with tabs and doubled quotes ── */
S = parse([HEAD, row('Ada One', 'Before\tafter, and he said "yes".'), row('Ben Two', 'Plain.')]);
assert.strictEqual(S.length, 2);
assert.strictEqual(S[0].essay, 'Before\tafter, and he said "yes".');

/* ── 4. no header row: columns map by position ── */
S = parse([row('Ada One', 'Plain.'), row('Ben Two', 'Plain too.')]);
assert.strictEqual(S.length, 2);
assert.strictEqual(S[0].name, 'Ada One');
assert.strictEqual(S[0].unit, 'abitur-text-analysis-demo');

/* ── 5. Excel's leading apostrophe is stripped from the scores ── */
assert.deepStrictEqual(S[0].ex, ['4/4', '3/4', '2/2', '5/5'],
  "the text-prefix ' was not stripped: " + JSON.stringify(S[0].ex));
assert.strictEqual(S[0].ex5, 'ticked');
assert.strictEqual(S[0].score, '14/15');

/* ── 6. the marker never reads column 12 — that is Shaun's own marking
   column, and nothing here may depend on or overwrite it. ── */
assert.ok(!('feedback' in S[0]), 'the parser pulled in the Feedback column');

/* ── 7. a paste that stops short of column 12 still parses ── */
var short = row('Ada One', 'Plain.').slice(0, 11);
var text = tsv([HEAD.slice(0, 11), short]);
S = rowsToStudents(splitDelimited(text, sniffDelim(text)))
  .filter(function (s) { return s.name || s.essay; });
assert.strictEqual(S.length, 1);
assert.strictEqual(S[0].name, 'Ada One');
assert.strictEqual(S[0].essay, 'Plain.');

console.log('test-abitur-parse.js: all checks passed');
