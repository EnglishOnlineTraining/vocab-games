#!/usr/bin/env node
'use strict';
/*
 * marking-handout.js — printable feedback sheets for one sitting of one unit.
 *
 *   node scripts/marking-handout.js <data.json> [out-basename] [--no-summary]
 *
 * Writes <out>.html, and <out>.pdf when Playwright is available (it is not a
 * repo dependency — print the HTML from a browser otherwise).
 *
 * Page 1 is a summary for the teacher: who took part, who did not, and every
 * score in one table. Shaun asked for it to stay (2026-09-29) after a first
 * run omitted it. Pass --no-summary only when the whole PDF is going to
 * students, since that page shows the class every classmate's marks.
 *
 * Then one page per student: their marks, what they wrote, the feedback, and
 * blank boxes to mark into. A student's page carries nothing but their own
 * work, so the stack can be guillotined and handed out.
 *
 * THE INPUT FILE IS STUDENT DATA AND MUST NEVER BE COMMITTED. Keep it outside
 * the repo (or in an ignored directory); this script is the only part that
 * belongs in git. See data-shape below.
 *
 * data-shape:
 * {
 *   "title": "Abitur — Text Analysis", "klass": "10a", "date": "25 September 2026",
 *   "exLabels": ["Ex 1","Ex 2","Ex 3","Ex 4"], "essayMax": 10,
 *   "absent": ["Student Name", ...],                     // optional
 *   "students": [{
 *     "name": "Stella Richter", "ex": ["5/5","4/4","4/4","5/5"],
 *     "objective": "18/18", "selfTicks": "9/10", "words": 153,
 *     "essay": "…", "feedback": ["…","…"]
 *   }]
 * }
 */
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2).filter(a => a !== '--no-summary');
const withSummary = !process.argv.includes('--no-summary');
if (!args[0]) { console.error('usage: marking-handout.js <data.json> [out-basename] [--no-summary]'); process.exit(1); }
const D = JSON.parse(fs.readFileSync(args[0], 'utf8'));
const out = args[1] || path.join(path.dirname(args[0]), 'handout');

const esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// The feedback lines are authored with light markdown; nothing else is.
const md = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\*(.+?)\*/g, '<i>$1</i>');
const LABELS = D.exLabels || ['Ex 1', 'Ex 2', 'Ex 3', 'Ex 4'];
const SUB = `${esc(D.title)} · Klasse ${esc(D.klass)} · ${esc(D.date)}`;

const CSS = `
@page{size:A4;margin:16mm 15mm 14mm}
*{box-sizing:border-box}
body{font:11pt/1.5 Georgia,'Times New Roman',serif;color:#111;margin:0}
.sheet{page-break-after:always}
.sheet:last-child{page-break-after:auto}
h1{font:600 15pt/1.25 'Segoe UI',system-ui,sans-serif;margin:0 0 2pt;letter-spacing:-.1pt}
.sub{font:9.5pt/1.4 'Segoe UI',system-ui,sans-serif;color:#555;margin:0 0 12pt;
     border-bottom:1.5pt solid #1a3a5c;padding-bottom:7pt}
h2{font:600 10pt/1.3 'Segoe UI',system-ui,sans-serif;text-transform:uppercase;
   letter-spacing:.7pt;color:#1a3a5c;margin:15pt 0 6pt}
table{border-collapse:collapse;font:9.5pt 'Segoe UI',system-ui,sans-serif}
table.sc td{border:.75pt solid #bbb;padding:3.5pt 9pt;text-align:center}
table.sc tr:first-child td{background:#eef2f7;font-weight:600;color:#1a3a5c}
table.sc td.tot{background:#1a3a5c;color:#fff;font-weight:700}
table.all{width:100%}
table.all th,table.all td{border:.75pt solid #ccc;padding:3pt 6pt;text-align:left;font-size:9pt}
table.all th{background:#eef2f7;color:#1a3a5c}
table.all td.n{text-align:center}
.note{font:8.5pt/1.45 'Segoe UI',system-ui,sans-serif;color:#666;margin:4pt 0 0}
blockquote{margin:0;padding:8pt 11pt;background:#f6f8fb;border-left:2.5pt solid #c9a227;
  font-size:10.5pt;white-space:pre-wrap}
blockquote.none{background:#fff;border-left-color:#bbb;color:#777;font-style:italic}
ul{margin:0;padding-left:16pt}li{margin:0 0 5pt}
.mark{margin-top:16pt;border:1pt solid #1a3a5c;padding:9pt 12pt;
  font:10pt 'Segoe UI',system-ui,sans-serif;display:flex;gap:26pt}
.mark b{color:#1a3a5c}
.foot{margin-top:10pt;font:8pt 'Segoe UI',system-ui,sans-serif;color:#888}
.teacher{font:8.5pt 'Segoe UI',system-ui,sans-serif;color:#b03030;margin:0 0 10pt;font-weight:600}
`;

function summaryPage() {
  const S = D.students;
  let h = `<div class="sheet"><h1>${esc(D.title)} — marking summary</h1>`;
  h += `<p class="sub">Klasse ${esc(D.klass)} · ${esc(D.date)} · ${S.length} submission${S.length === 1 ? '' : 's'}</p>`;
  h += `<p class="teacher">Teacher copy — this page shows every student's marks. Remove it before handing the rest out.</p>`;
  h += '<h2>Submissions</h2><table class="all"><tr><th>Student</th>'
    + LABELS.map(l => `<th>${esc(l)}</th>`).join('')
    + '<th>Total</th><th>Self-ticks</th><th>Words</th></tr>';
  for (const s of S) {
    h += `<tr><td>${esc(s.name)}</td>`
      + (s.ex || []).map(v => `<td class="n">${esc(v)}</td>`).join('')
      + `<td class="n"><b>${esc(s.objective)}</b></td>`
      + `<td class="n">${esc(s.selfTicks || '—')}</td>`
      + `<td class="n">${s.words || 0}</td></tr>`;
  }
  h += '</table>';
  h += `<p class="note">Self-ticks are the student's own self-assessment and carry no marks.</p>`;
  if (D.absent && D.absent.length) {
    h += `<h2>No submission (${D.absent.length})</h2><p style="font-size:9.5pt">`
      + D.absent.map(esc).join(' · ') + '</p>';
  }
  h += '<p class="foot">englishonline.training</p></div>';
  return h;
}

function studentPage(s) {
  let h = `<div class="sheet"><h1>${esc(s.name)}</h1><p class="sub">${SUB}</p>`;
  h += '<h2>Your marks</h2><table class="sc"><tr>'
    + LABELS.map(l => `<td>${esc(l)}</td>`).join('') + '<td class="tot">Total</td></tr><tr>'
    + (s.ex || []).map(v => `<td>${esc(v)}</td>`).join('')
    + `<td class="tot">${esc(s.objective)}</td></tr></table>`;
  if (s.selfTicks) {
    h += `<p class="note">${esc(LABELS.join(', '))} are marked automatically. The paragraph I mark myself, `
      + `below. You ticked ${esc(s.selfTicks)} boxes on the self-check; those are for your own use `
      + `and carry no marks.</p>`;
  }
  h += '<h2>Your paragraph'
    + (s.words ? ` <span style="font-weight:400;text-transform:none;letter-spacing:0;color:#666">(${s.words} words${D.wordBrief ? ' — the task asks for ' + esc(D.wordBrief) : ''})</span>` : '')
    + '</h2>';
  h += s.words
    ? `<blockquote>${esc(String(s.essay).trim())}</blockquote>`
    : '<blockquote class="none">You did not submit a paragraph.</blockquote>';
  h += '<h2>My feedback</h2><ul>' + (s.feedback || []).map(l => `<li>${md(l)}</li>`).join('') + '</ul>';
  const total = (parseInt(String(s.objective).split('/')[1], 10) || 0) + (D.essayMax || 0);
  h += `<div class="mark"><span><b>Paragraph mark:</b> ______ / ${D.essayMax || 10}</span>`
    + `<span><b>Overall:</b> ______ / ${total}</span></div>`;
  h += '<p class="foot">englishonline.training</p></div>';
  return h;
}

const body = (withSummary ? summaryPage() : '') + D.students.map(studentPage).join('');
const html = `<!doctype html><html lang="en"><meta charset="utf-8">`
  + `<title>${esc(D.title)} — ${esc(D.klass)} feedback</title><style>${CSS}</style>${body}`;
fs.writeFileSync(out + '.html', html);
const pages = D.students.length + (withSummary ? 1 : 0);
console.log(`${out}.html — ${pages} page${pages === 1 ? '' : 's'}`);

(async () => {
  let chromium;
  try { ({ chromium } = require('playwright')); }
  catch { console.log('playwright not installed — print the HTML from a browser for the PDF'); return; }
  // Chromium ships in this container but the npm package may pin another build.
  const exe = process.env.EOL_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
  const b = await chromium.launch(fs.existsSync(exe) ? { executablePath: exe } : {});
  const p = await b.newPage();
  await p.goto('file://' + path.resolve(out + '.html'), { waitUntil: 'load' });
  await p.pdf({ path: out + '.pdf', format: 'A4', printBackground: true });
  await b.close();
  console.log(`${out}.pdf`);
})();
