// E2E check for esl-countable-uncountable.html: every Check button, one deliberate wrong answer
// per section surfacing its explanation, no sideways scroll at 375px, a clean console, and the
// test-mode payload carrying unit, score and grade.
const { test, expect } = require('@playwright/test');

const PAGE = '/esl-countable-uncountable.html';
const CORRECT = {
  exA: { g1: 'some', g2: 'many', g3: 'much', g4: 'a little', g5: 'a lot of', g6: 'many' },
  exB: { g1: 'much', g2: 'many', g3: 'many', g4: 'much', g5: 'much', g6: 'many', g7: 'many', g8: 'much' },
  exC: { g1: 'little', g2: 'a little', g3: 'few', g4: 'a few', g5: 'Few', g6: 'a little', g7: 'an', g8: 'a little' },
};
const EX_D_TEXT = "Hi! There isn't much milk in my kitchen, but there are a lot of apples. I have a few eggs and a little cheese. We do not have many vegetables, so we can shop together on Saturday. How many days will you stay with me? How much do you eat for breakfast? I can buy more food for you.";

async function answer(page, ex, wrong) {
  for (const [gap, value] of Object.entries(CORRECT[ex])) {
    await page.selectOption(`#${ex}-${gap}`, wrong && wrong.gap === gap ? wrong.value : value);
  }
}
async function expectNoSidewaysScroll(page) {
  const width = await page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth));
  expect(width).toBeLessThanOrEqual(375);
}

test('practise mode: checks, explanations, score card, 375px, clean console', async ({ page }) => {
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.setViewportSize({ width: 375, height: 800 });

  await page.goto(`${PAGE}?mode=practise`);
  await expect(page.locator('#exA-g1')).toBeVisible();

  await answer(page, 'exA', { gap: 'g1', value: 'many' });
  await page.locator('#step-1 button:has-text("Check")').click();
  await expect(page.locator('#step1-fb')).toContainText('5 / 6');
  await expectNoSidewaysScroll(page);
  await page.locator('#step-1 button:has-text("Continue")').click();

  await answer(page, 'exB', { gap: 'g1', value: 'many' });
  await page.locator('#step-2 button:has-text("Check")').click();
  await expect(page.locator('#step2-fb')).toContainText('7 / 8');
  await page.locator('#step-2 button:has-text("Continue")').click();

  await answer(page, 'exC', { gap: 'g7', value: 'a' });
  await page.locator('#step-3 button:has-text("Check")').click();
  await expect(page.locator('#step3-fb')).toContainText('7 / 8');
  await page.locator('#step-3 button:has-text("Continue")').click();

  await page.locator('#exD-text').fill(EX_D_TEXT);
  await page.locator('#step-4 button.btn-primary').click();

  await expect(page.locator('#score-display')).toContainText('19 / 22');
  const expl = page.locator('#explanations');
  await expect(expl).toContainText('"Milk" is uncountable');          // exA-g1
  await expect(expl).toContainText('"Water" is uncountable');         // exB-g1
  await expect(expl).toContainText('Recall from the Articles page');  // exC-g7, spaced recall
  await expectNoSidewaysScroll(page);

  expect(errors).toEqual([]);
});

test('submission payload carries unit, score and grade', async ({ page }) => {
  await page.goto(PAGE);
  await page.fill('#inp-name', 'Test Student');
  await page.fill('#inp-class', 'B1 test');
  await page.locator('button:has-text("Start Exercises")').click();
  for (const [n, ex] of [[1, 'exA'], [2, 'exB'], [3, 'exC']]) {
    await answer(page, ex);
    await page.locator(`#step-${n} button:has-text("Continue")`).click();
  }
  await page.locator('#exD-text').fill(EX_D_TEXT);
  await page.locator('#step-4 button.btn-primary').click();

  const payloadPromise = new Promise((resolve) => {
    page.on('console', async (m) => {
      if (m.text().includes('TEST MODE - Submission payload')) resolve(await m.args()[1].jsonValue());
    });
  });
  await page.locator('#submit-btn').click();
  const payload = await payloadPromise;
  expect(payload.unit).toBe('esl-countable-uncountable');
  expect(payload.score).toBe('22 / 22');
  expect(payload.grade).toMatch(/^Note /);
});
