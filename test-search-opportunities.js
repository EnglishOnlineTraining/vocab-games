/*
 * test-search-opportunities.js — the Search Console import in
 * scripts/search-opportunities.js (--csv): CSV parsing, leaks and gaps.
 * Run with: node test-search-opportunities.js   (node:test, built in — no npm dependency)
 *
 * The import feeds the monthly Search Console review (docs/seo-backlog.md,
 * Tier 13.2). A parsing slip here means a wrong list with no error, so the
 * export's real shapes (English and German UI, quoted fields) are pinned.
 */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  parseCsv, toInt, toDecimal, readGscCsv, locateExport, findLeaks, findGaps, titleMatches,
} = require('./scripts/search-opportunities.js');

function tmpDir(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gsc-'));
  for (const [name, body] of Object.entries(files)) fs.writeFileSync(path.join(dir, name), body);
  return dir;
}

function row(key, clicks, impressions, position) {
  return { key, clicks, impressions, ctr: impressions ? clicks / impressions : 0, position };
}

test('parseCsv: quotes, escaped quotes, commas, CRLF and a BOM', () => {
  const rows = parseCsv('﻿a,b\r\n"x, y","say ""hi"""\r\n\r\nlast,1');
  assert.deepStrictEqual(rows, [['a', 'b'], ['x, y', 'say "hi"'], ['last', '1']]);
});

test('numbers: thousands separators and a German decimal comma', () => {
  assert.strictEqual(toInt('1,234'), 1234);
  assert.strictEqual(toInt('1.234'), 1234);
  assert.strictEqual(toDecimal('8,5'), 8.5);
  assert.strictEqual(toDecimal('12.25'), 12.25);
});

test('readGscCsv: English export; CTR is recomputed, not parsed', () => {
  const dir = tmpDir({ 'Queries.csv': 'Top queries,Clicks,Impressions,CTR,Position\n"good, bad emails",3,100,99%,7.9\n' });
  const [r] = readGscCsv(path.join(dir, 'Queries.csv'));
  assert.strictEqual(r.key, 'good, bad emails');
  assert.strictEqual(r.ctr, 0.03);
  assert.strictEqual(r.position, 7.9);
});

test('readGscCsv: German export headers and number format', () => {
  const dir = tmpDir({ 'Queries.csv': 'Häufigste Suchanfragen,Klicks,Impressionen,CTR,Position\nmsa englisch,1,"1.200","0,08 %","8,4"\n' });
  const [r] = readGscCsv(path.join(dir, 'Queries.csv'));
  assert.strictEqual(r.impressions, 1200);
  assert.strictEqual(r.position, 8.4);
});

test('readGscCsv: rejects a file that is not a Search Console export', () => {
  const dir = tmpDir({ 'x.csv': 'Date,Clicks,Impressions\n2026-10-01,1,2\n' });
  assert.throws(() => readGscCsv(path.join(dir, 'x.csv')), /expected the columns/);
});

test('locateExport: folder with both files, folder without Queries.csv, lone Pages.csv', () => {
  const both = tmpDir({ 'Queries.csv': 'Top queries,Clicks,Impressions,CTR,Position\n', 'Pages.csv': 'Top pages,Clicks,Impressions,CTR,Position\n' });
  const found = locateExport(both);
  assert.ok(found.queries.endsWith('Queries.csv') && found.pages.endsWith('Pages.csv'));
  assert.throws(() => locateExport(tmpDir({ 'Pages.csv': 'x' })), /no Queries\.csv/);
  const lone = tmpDir({ 'Pages.csv': 'Top pages,Clicks,Impressions,CTR,Position\n' });
  assert.deepStrictEqual(locateExport(path.join(lone, 'Pages.csv')), { queries: null, pages: path.join(lone, 'Pages.csv') });
});

test('findLeaks: judged against the other rows at the same position, not itself', () => {
  const rows = [
    row('leak', 0, 200, 3.2),    // others at pos 3 earn 10% → leak
    row('normal', 10, 100, 3.4), // others at pos 3 earn 0% → no baseline above zero
    row('far', 0, 500, 15),      // not page 1
  ];
  const { leaks } = findLeaks(rows);
  assert.deepStrictEqual(leaks.map(l => l.key), ['leak']);
  assert.strictEqual(leaks[0].expected, 0.1);
});

test('findLeaks: a row alone at its position has no baseline and is counted, not listed', () => {
  const { leaks, noBaseline } = findLeaks([row('alone', 0, 300, 5)]);
  assert.strictEqual(leaks.length, 0);
  assert.strictEqual(noBaseline, 1);
});

test('findLeaks: thresholds can be changed', () => {
  const rows = [row('a', 1, 30, 2), row('b', 10, 100, 2)];
  // a: 3.3% vs 10% → leak at ratio 0.5, not at ratio 0.3
  assert.strictEqual(findLeaks(rows).leaks.length, 1);
  assert.strictEqual(findLeaks(rows, { ratio: 0.3 }).leaks.length, 0);
  assert.strictEqual(findLeaks(rows, { minImpr: 50 }).leaks.length, 0);
});

test('findGaps: past position 10, zero clicks, enough impressions; sorted by impressions', () => {
  const rows = [
    row('small gap', 0, 25, 30),
    row('big gap', 0, 400, 22),
    row('has clicks', 1, 400, 22),
    row('page one', 0, 400, 9),
    row('too few', 0, 5, 40),
  ];
  assert.deepStrictEqual(findGaps(rows, []).map(g => g.key), ['big gap', 'small gap']);
});

test('titleMatches: every content word must be in the title', () => {
  const pages = [{ file: 'be-property-management.html', title: 'Property Management English' }];
  assert.deepStrictEqual(titleMatches('property management in english', pages), ['be-property-management.html']);
  assert.deepStrictEqual(titleMatches('property law english', pages), []);
  assert.deepStrictEqual(titleMatches('the and', pages), []);
});
