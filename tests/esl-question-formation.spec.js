// E2E for esl-question-formation: plays the page in practise mode, getting one answer per
// dropdown section wrong, and checks the review shows that item's explanation; also checks
// there is no sideways scroll at 375 px and the submit payload carries unit, score and grade.
// Artifact: test-results/esl-question-formation-review.png (the review screen).
const { test, expect } = require('@playwright/test');
const URL = '/esl-question-formation.html';

async function answerSection(page, prefix, count, wrongFirst) {
  // Answers come from the page's own EXPLAIN data; the first gap gets a wrong option when asked.
  await page.evaluate(({ prefix, count, wrongFirst }) => {
    const ex = EXPLAIN[prefix.replace('-', '')].gaps;
    for (let i = 1; i <= count; i++) {
      const sel = document.getElementById(prefix + 'g' + i);
      const opts = [...sel.options].map(o => o.value).filter(Boolean);
      sel.value = (i === 1 && wrongFirst) ? opts.find(v => v !== ex['g' + i].correct) : ex['g' + i].correct;
    }
  }, { prefix, count, wrongFirst });
}

test('practise run: one wrong answer per section shows its explanation; payload is complete', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.route('**/script.google.com/**', r => r.abort());
  await page.goto(URL + '?mode=practise');
  await expect(page.locator('#step-1')).toHaveClass(/active/);

  const wrongLabels = [];
  for (const [step, prefix, n, check] of [[1, 'exA-', 6, 'checkExA'], [2, 'exB-', 8, 'checkExB'], [3, 'exC-', 8, 'checkExC']]) {
    await answerSection(page, prefix, n, true);
    await page.evaluate(c => window[c](), check);
    wrongLabels.push(await page.evaluate(p => EXPLAIN[p.replace('-', '')].gaps.g1.why, prefix));
    await page.locator('#step-' + step + ' button[onclick="nextStep(' + step + ')"]').click();
  }
  await page.fill('#exD-text', 'Dear Sir or Madam, when does the course start? Could you tell me where the school is?');
  await page.locator('#step-4 button[onclick="nextStep(4)"]').click();

  const review = page.locator('#explanations');
  await expect(review).toBeVisible();
  for (const why of wrongLabels) await expect(review).toContainText(why);
  await page.screenshot({ path: 'test-results/esl-question-formation-review.png', fullPage: true });
  expect(errors).toEqual([]);
});

test('payload carries unit, score and grade; no sideways scroll at 375 px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto(URL);
  await page.fill('#inp-name', 'Test Learner');
  await page.fill('#inp-class', 'zz');
  await page.locator('button:has-text("Start Exercises")').click();
  const payload = new Promise(resolve => page.on('console', async m => {
    if (m.text().includes('TEST MODE - Submission payload')) resolve(await m.args()[1].jsonValue());
  }));
  for (const [step, prefix, n, check] of [[1, 'exA-', 6, 'checkExA'], [2, 'exB-', 8, 'checkExB'], [3, 'exC-', 8, 'checkExC']]) {
    await expect(page.locator('#step-' + step)).toHaveClass(/active/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await answerSection(page, prefix, n, false);
    await page.evaluate(c => window[c](), check);
    await page.locator('#step-' + step + ' button[onclick="nextStep(' + step + ')"]').click();
  }
  await page.fill('#exD-text', 'When does the course start?');
  await page.locator('#step-4 button[onclick="nextStep(4)"]').click();
  await page.evaluate(() => submitToSheet());
  const p = await payload;
  expect(p.unit).toBe('esl-question-formation');
  expect(p.score).toBe('22 / 22');
  expect(p.grade).toMatch(/^Note 1/);
});
