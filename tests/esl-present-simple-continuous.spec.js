// E2E for esl-present-simple-continuous: one wrong answer per graded section, then the
// review step must show that section's explanation, the 375 px layout must not scroll
// sideways, there must be no console errors, and the test-mode payload must carry unit/score/grade.
// Answers come from the page's own EXPLAIN data, so the spec has no second copy of the key.
const { test, expect } = require('@playwright/test');

test('esl-present-simple-continuous: wrong answers explained, payload graded', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('/esl-present-simple-continuous.html');
  await page.fill('#inp-name', 'Test Learner');
  await page.fill('#inp-class', 'zz');
  await page.locator('button:has-text("Start Exercises")').click();

  const payload = new Promise(resolve => {
    page.on('console', async m => {
      if (m.text().includes('TEST MODE - Submission payload')) resolve(await m.args()[1].jsonValue());
    });
  });

  const wrongWhy = [];
  for (const [n, ex] of [[1, 'exA'], [2, 'exB'], [3, 'exC']]) {
    const why = await page.evaluate(([ex]) => {
      const gaps = EXPLAIN[ex].gaps;
      Object.keys(gaps).forEach((k, i) => {
        const sel = document.getElementById(ex + '-' + k);
        const opts = [...sel.options].map(o => o.value).filter(Boolean);
        sel.value = i === 0 ? opts.find(o => o !== gaps[k].correct) : gaps[k].correct;
      });
      return gaps.g1.why;
    }, [ex]);
    wrongWhy.push(why);
    await page.evaluate(ex => window['check' + ex[0].toUpperCase() + ex.slice(1)](), ex);
    expect(await page.evaluate(w => document.documentElement.scrollWidth <= innerWidth, 0)).toBe(true);
    await page.evaluate(n => nextStep(n), n);
  }
  await page.fill('#exD-text', 'On weekends I usually play football. I am writing to you now.');
  await page.evaluate(() => nextStep(4));

  const expl = await page.locator('.expl-wrong .expl-why').allTextContents();
  for (const w of wrongWhy) expect(expl).toContain(w);

  await page.evaluate(() => submitToSheet());
  const p = await payload;
  expect(p.unit).toBe('esl-present-simple-continuous');
  expect(p.score).toMatch(/^\d+ \/ 23$/);
  expect(p.grade).toMatch(/^Note /);
  expect(errors).toEqual([]);
});
