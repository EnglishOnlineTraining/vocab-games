// E2E for 8c-nyc-first-day: the answer keys, the wrong-answer explanations, the practise
// run through every step, the test-mode payload (unit, score, grade) and phone width.
// Artifact: test-results/8c-nyc-first-day-results.png (practise results screen).
const { test, expect } = require('@playwright/test');

const KEYS = {
  exA: ['Hamburg', 'at ten at night', 'subway', 'bagels', 'noise', 'brother'],
  exB: ['went', 'bought', 'saw', 'took', 'ate', 'made', 'came', 'live'],
  exC: ["didn't like", 'Did you visit', "didn't take", 'did you go', "didn't come", 'Did you see', "didn't stop", 'did you buy'],
};

test('8c-nyc-first-day: practise run, explanations, payload, phone width', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.route('**/hook.eu1.make.com/**', (r) => r.abort());

  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('/8c-nyc-first-day.html?mode=practise');

  const steps = [['exA', 1, 'checkExA'], ['exB', 2, 'checkExB'], ['exC', 3, 'checkExC']];
  for (const [ex, n] of steps) {
    await expect(page.locator('#step-' + n)).toHaveClass(/active/);
    // Fill every gap right, except gap 1 deliberately wrong.
    await page.evaluate(([ex, keys]) => keys.forEach((k, i) => {
      const s = document.getElementById(ex + '-g' + (i + 1));
      const wrong = [...s.options].map((o) => o.value).filter((v) => v && v !== k)[0];
      s.value = i === 0 ? wrong : k;
    }), [ex, KEYS[ex]]);
    await page.locator(`#step-${n} button:has-text("Check")`).click();
    await expect(page.locator('#step' + n + '-fb')).toContainText('correct');
    // Fix every gap except Exercise A's first: that one stays wrong for the results screen.
    if (ex !== 'exA') {
      await page.evaluate(([ex, k]) => { document.getElementById(ex + '-g1').value = k; }, [ex, KEYS[ex][0]]);
      await page.locator(`#step-${n} button:has-text("Check")`).click();
    }
    await page.locator(`#step-${n} button[onclick="nextStep(${n})"]`).click();
  }

  await page.fill('#exD-text', 'Hi Sam, I am in New York with my class. Today we went to Central Park and saw a lot of squirrels. We ate pizza in Little Italy and I bought a cap. Then we took the subway to Times Square. I didn\'t like the crowds, but the lights were great. See you soon!');
  await page.locator('#step-4 button[onclick="nextStep(4)"]').click();
  await expect(page.locator('#step-5')).toHaveClass(/active/);
  // The wrong gap's reason from data/explanations.json appears on the results screen.
  const why = await page.evaluate(() => EXPLAIN.exA.gaps.g1.why);
  await expect(page.locator('#step-5')).toContainText(why.slice(0, 30));
  await page.screenshot({ path: 'test-results/8c-nyc-first-day-results.png' });

  // No sideways scroll at 375 px on any step.
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('8c-nyc-first-day: every answer key is one of the options and positions vary', async ({ page }) => {
  await page.goto('/8c-nyc-first-day.html');
  const r = await page.evaluate((KEYS) => Object.entries(KEYS).map(([ex, keys]) => ({
    ex,
    allValid: keys.every((k, i) => [...document.getElementById(ex + '-g' + (i + 1)).options].some((o) => o.value === k)),
    positions: new Set(keys.map((k, i) => [...document.getElementById(ex + '-g' + (i + 1)).options].findIndex((o) => o.value === k))).size,
  })), KEYS);
  for (const x of r) { expect(x.allValid, x.ex).toBe(true); expect(x.positions, x.ex).toBeGreaterThan(1); }
});

test('8c-nyc-first-day: test-mode payload carries unit, score and grade', async ({ page }) => {
  await page.goto('/8c-nyc-first-day.html');
  await page.fill('#inp-name', 'Test Learner');
  await page.fill('#inp-class', 'zz');
  await page.locator('button:has-text("Start Exercises")').click();
  const payload = new Promise((resolve) => page.on('console', async (m) => {
    if (m.text().includes('TEST MODE - Submission payload')) resolve(await m.args()[1].jsonValue());
  }));
  await page.evaluate((KEYS) => {
    for (const [ex, keys] of Object.entries(KEYS)) {
      keys.forEach((k, i) => { document.getElementById(ex + '-g' + (i + 1)).value = k; });
      window['check' + ex.replace('ex', 'Ex')]();
    }
    submitToSheet();
  }, KEYS);
  const p = await payload;
  expect(p.unit).toBe('8c-nyc-first-day');
  expect(p.score).toBe('22 / 22');
  expect(p.grade).toMatch(/^Note 1/);
});
