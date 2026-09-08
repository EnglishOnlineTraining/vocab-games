/*
 * regrade-rows.js — rebuild the answer-review column for rows written while the
 * Make grading module was broken.
 *
 *   node scripts/regrade-rows.js <export.csv> [--out fixed.csv]
 *
 * Between 2026-09-07 and 2026-09-08 the Make scenarios re-graded each submission
 * against a fetched answer key and got it wrong: every gap read "(blank)" and every
 * paper scored 0/N. The marks themselves were never affected — Score and Grade come
 * from the page — but the review column is false on those rows.
 *
 * Nothing is lost, because the scenario also wrote the complete raw submission into
 * the last answer column (header "Ex48", the {{1.payload}} backstop). This reads that
 * column back and regenerates the review text with make-grader.js, which is checked
 * against every unit by test-make-grader.js.
 *
 * Export the table to CSV from Excel and pass it here; the payload column is found by
 * content, not by position, so column order does not matter.
 */
const fs = require('fs');
const path = require('path');
const { gradeSubmission } = require('../make-grader.js');

const KEYS = path.join(__dirname, '..', 'data', 'answer-keys');

/* RFC4180 CSV: quoted fields may contain commas, newlines and doubled quotes. */
function parseCsv(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
      continue;
    }
    if (c === '"') { inQuotes = true; continue; }
    if (c === ',') { row.push(field); field = ''; continue; }
    if (c === '\r') continue;
    if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; continue; }
    field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function csvCell(s) {
  return /[",\n]/.test(s) ? '"' + String(s).replace(/"/g, '""') + '"' : s;
}

function main() {
  const file = process.argv[2];
  if (!file) { console.error('usage: node scripts/regrade-rows.js <export.csv> [--out fixed.csv]'); process.exit(2); }
  const outIdx = process.argv.indexOf('--out');
  const outFile = outIdx > -1 ? process.argv[outIdx + 1] : null;

  const rows = parseCsv(fs.readFileSync(file, 'utf8'));
  if (!rows.length) { console.error('empty file'); process.exit(1); }
  const header = rows[0];

  // Find the payload column by content: the only cell holding a JSON object with a unit.
  let payloadCol = -1;
  for (let c = 0; c < header.length && payloadCol === -1; c++) {
    for (let r = 1; r < rows.length; r++) {
      const v = (rows[r][c] || '').trim();
      if (v.startsWith('{') && v.includes('"unit"')) { payloadCol = c; break; }
    }
  }
  if (payloadCol === -1) {
    console.error('No raw-payload column found. Expected a cell of JSON containing "unit"\n'
      + '(the Ex48 column). Re-export including every column.');
    process.exit(1);
  }
  console.log('payload column: ' + payloadCol + ' (header "' + (header[payloadCol] || '') + '")\n');

  const out = [['Timestamp', 'Name', 'Class', 'Unit', 'Corrected answer review']];
  let done = 0, nokey = 0, bad = 0;

  for (let r = 1; r < rows.length; r++) {
    const raw = (rows[r][payloadCol] || '').trim();
    if (!raw) continue;
    let p;
    try { p = JSON.parse(raw); } catch (e) { bad++; continue; }

    const keyPath = path.join(KEYS, p.unit + '.json');
    let text;
    if (!fs.existsSync(keyPath)) {
      text = 'No auto-graded gaps in this unit.';
      nokey++;
    } else {
      text = gradeSubmission(p, JSON.parse(fs.readFileSync(keyPath, 'utf8'))).text;
      done++;
    }
    out.push([rows[r][0] || '', p.name || '', p.cls || '', p.unit || '', text]);
    console.log([p.cls, p.name, p.unit].join(' | ') + '\n   ' + text + '\n');
  }

  console.log('regraded ' + done + ' row(s); ' + nokey + ' unit(s) have no auto-graded gaps; '
    + bad + ' unparseable payload(s).');

  if (outFile) {
    fs.writeFileSync(outFile, out.map(r => r.map(csvCell).join(',')).join('\n') + '\n');
    console.log('wrote ' + outFile);
  }
}

if (require.main === module) main();
