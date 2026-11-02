#!/usr/bin/env node
/*
 * check-indexnow-threshold.js — the IndexNow skip rule in indexnow-submit.js.
 *
 * Usage: node scripts/check-indexnow-threshold.js
 */

const assert = require('assert');
const { MAX_CHANGED_PAGES, shouldSkip } = require('./indexnow-submit.js');

const urls = n => Array.from({ length: n }, (_, i) => `https://example.test/${i}.html`);

assert.strictEqual(shouldSkip([]), false);
assert.strictEqual(shouldSkip(urls(MAX_CHANGED_PAGES)), false, 'exactly the limit still submits');
assert.strictEqual(shouldSkip(urls(MAX_CHANGED_PAGES + 1)), true, 'one over the limit skips');
console.log(`check-indexnow-threshold: ok (limit ${MAX_CHANGED_PAGES})`);
