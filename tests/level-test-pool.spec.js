// @ts-check
const { test, expect } = require('@playwright/test');

/*
 * Content-integrity tests for the level-test question pool.
 *
 * The pool lives inline in level-test.html (var POOL), so a typo in an
 * option string or a missing "why" ships silently — the flow tests in
 * placement-quiz.spec.js are content-agnostic. These checks iterate every
 * item and fail on any structural problem.
 */

const PAGE = '/level-test.html';

test('pool has 25 items per CEFR level (125 total)', async ({ page }) => {
  await page.goto(PAGE);
  const counts = await page.evaluate(() =>
    ['A1', 'A2', 'B1', 'B2', 'C1'].map(l => POOL[l].length)
  );
  expect(counts).toEqual([25, 25, 25, 25, 25]);
});

test('every item is structurally valid', async ({ page }) => {
  await page.goto(PAGE);
  const problems = await page.evaluate(() => {
    const out = [];
    const seen = new Set();
    ['A1', 'A2', 'B1', 'B2', 'C1'].forEach(lvl => {
      POOL[lvl].forEach(q => {
        const tag = q.id + ': ';
        if (seen.has(q.id)) out.push('duplicate id ' + q.id);
        seen.add(q.id);
        if (!q.id.startsWith(lvl.toLowerCase() + '_')) out.push(tag + 'id does not match its level');
        if (!Array.isArray(q.options) || q.options.length !== 3) out.push(tag + 'needs exactly 3 options');
        if (q.options && new Set(q.options).size !== q.options.length) out.push(tag + 'has duplicate options');
        if (q.options && !q.options.includes(q.correct)) out.push(tag + 'correct answer is not one of the options: "' + q.correct + '"');
        const gaps = (q.stem.match(/___/g) || []).length;
        const parts = q.correct.split('…').length;
        if (gaps < 1) out.push(tag + 'stem has no gap');
        if (gaps !== parts) out.push(tag + 'has ' + gaps + ' gap(s) but the answer has ' + parts + ' part(s)');
        if (!q.why || q.why.trim().length < 10) out.push(tag + 'missing or too-short why');
        if (!q.topic) out.push(tag + 'missing topic tag');
      });
    });
    return out;
  });
  expect(problems).toEqual([]);
});

test('no duplicate stems within a level', async ({ page }) => {
  await page.goto(PAGE);
  const problems = await page.evaluate(() => {
    const out = [];
    ['A1', 'A2', 'B1', 'B2', 'C1'].forEach(lvl => {
      const stems = POOL[lvl].map(q => q.stem);
      const dupes = stems.filter((s, i) => stems.indexOf(s) !== i);
      dupes.forEach(s => out.push(lvl + ': duplicate stem "' + s + '"'));
    });
    return out;
  });
  expect(problems).toEqual([]);
});

test('fillGaps handles one-gap and two-gap answers', async ({ page }) => {
  await page.goto(PAGE);
  const filled = await page.evaluate(() => ({
    one: fillGaps('I have never ___ to Japan.', 'been'),
    two: fillGaps('When I arrived, the film ___ already ___.', 'had … started'),
    newTwo: fillGaps('The exam was ___ difficult ___ I expected.', 'as … as')
  }));
  expect(filled.one).toBe('I have never been to Japan.');
  expect(filled.two).toBe('When I arrived, the film had already started.');
  expect(filled.newTwo).toBe('The exam was as difficult as I expected.');
});

test('fillGapsHtml wraps each filled part in <strong>', async ({ page }) => {
  await page.goto(PAGE);
  const html = await page.evaluate(() => fillGapsHtml('The film was ___ boring ___ I fell asleep.', 'so … that'));
  expect(html).toBe('The film was <strong>so</strong> boring <strong>that</strong> I fell asleep.');
});
