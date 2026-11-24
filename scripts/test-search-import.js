#!/usr/bin/env node
// Fixture check for Tier 26.5: search-console-mcp JSON imports; its one-cell CSV is rejected.
const assert = require('assert');
const path = require('path');
const so = require('./search-opportunities.js');
const dir = path.join(__dirname, '..', 'tests', 'fixtures', 'gsc-tool');
const q = so.readGscCsv(path.join(dir, 'queries.json'));
assert.strictEqual(q.length, 3);
assert.deepStrictEqual([q[0].key, q[0].impressions, q[2].position], ['afb 123', 140, 19.4]);
assert.strictEqual(so.locateExport(path.join(dir, 'queries.json')).pages, null);
assert.strictEqual(so.locateExport(path.join(dir, 'pages.json')).queries, null);
assert.strictEqual(so.readGscCsv(path.join(dir, 'pages.json'))[0].clicks, 18);
assert.strictEqual(so.findLeaks(q, { minImpr: 20, ratio: 0.5 }).leaks[0].key, 'afb 123'); // pos 2, 0 clicks vs 9%
assert.throws(() => so.readGscCsv(path.join(dir, 'csv-cell.csv')), /expected the columns/);
console.log('search-opportunities tool import: ok');
