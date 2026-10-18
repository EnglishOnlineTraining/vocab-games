// E2E check for ielts-writing-task2-problem-solution-essay.html (B6 of the ielts-exercise-draft skill).
// Covers the skill's browser-check list: every Check button, a deliberate wrong answer per
// section surfacing its explanation, the English-only score card (points (N%), no Note), the
// IELTS writing rubric, no sideways scroll at 375px, a clean console, and the email-only
// submission payload.
const { test, expect } = require('@playwright/test');

const PAGE = '/ielts-writing-task2-problem-solution-essay.html';

const CORRECT = {
  exA: { g1: 'leads to', g2: 'due to', g3: 'mean that', g4: 'To address the problem of large packs', g5: 'if', g6: 'would result in' },
  exB: { g1: 'leads to', g2: 'is caused by', g3: 'due to', g4: 'because', g5: 'As a result', g6: 'result in', g7: 'result from', g8: 'due' },
  exC: {
    g1: 'Local councils could run free weekly clubs where older people can meet.',
    g2: 'Cities could build more affordable housing near business districts.',
    g3: 'Parents and schools could set daily screen-time limits and plan outdoor activities.',
    g4: 'Supermarkets could sell more loose fruit and vegetables.',
    g5: 'Bus lanes could be added so that buses are quicker than cars.',
    g6: 'Critics',
    g7: 'Although',
  },
};

const EX_D_TEXT = 'Traffic congestion is a growing problem in many cities. This essay will look at its main causes and suggest some solutions. One major cause is that public transport is often slow, so many people prefer to drive. Another cause is that new housing is built far from workplaces, which leads to long daily journeys by car. To address the first cause, cities could add bus lanes so that buses are quicker than cars. In addition, if new homes were built closer to offices, fewer people would need to drive. In conclusion, congestion is caused by slow public transport and long commutes, and better buses and planning could reduce it.';

function watchConsole(page, errors) {
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
}

async function answerSection(page, ex, wrong) {
  for (const [gap, value] of Object.entries(CORRECT[ex])) {
    await page.selectOption(`#${ex}-${gap}`, wrong && wrong.gap === gap ? wrong.value : value);
  }
}

async function expectNoSidewaysScroll(page) {
  const width = await page.evaluate(() =>
    Math.max(document.documentElement.scrollWidth, document.body.scrollWidth));
  expect(width).toBeLessThanOrEqual(375);
}

test('practise mode: checks, explanations, score card, rubric, 375px, clean console', async ({ page }) => {
  const errors = [];
  watchConsole(page, errors);
  await page.setViewportSize({ width: 375, height: 800 });

  await page.goto(`${PAGE}?mode=practise`);
  await expect(page.locator('#exA-g1')).toBeVisible();
  await expectNoSidewaysScroll(page);

  // Ex A — one deliberate wrong answer: "because" before a noun phrase
  await answerSection(page, 'exA', { gap: 'g2', value: 'because' });
  await page.locator('#step-1 button:has-text("Check")').click();
  await expect(page.locator('#step1-fb')).toContainText('5 / 6 correct');
  await expect(page.locator('#exA-g2')).toHaveClass(/gap-wrong/);
  await page.locator('#step-1 button:has-text("Continue")').click();

  // Ex B — one deliberate wrong answer: "because" before a noun phrase
  await answerSection(page, 'exB', { gap: 'g3', value: 'because' });
  await page.locator('#step-2 button:has-text("Check")').click();
  await expect(page.locator('#step2-fb')).toContainText('7 / 8 correct');
  await page.locator('#step-2 button:has-text("Continue")').click();

  // Ex C — one deliberate wrong answer: a solution that makes the cause worse
  await answerSection(page, 'exC', { gap: 'g3', value: 'Schools could buy more computers.' });
  await page.locator('#step-3 button:has-text("Check")').click();
  await expect(page.locator('#step3-fb')).toContainText('6 / 7 correct');
  await page.locator('#step-3 button:has-text("Continue")').click();

  // Ex D — free writing, then review
  await page.locator('#exD-text').fill(EX_D_TEXT);
  await page.locator('#step-4 button.btn-primary').click();

  // Score card: points (N%), the IELTS band note, and no German Note
  const score = page.locator('#score-display');
  await expect(score).toBeVisible();
  await expect(score).toContainText('18 / 21 points (86%)');
  await expect(score).toContainText('band');
  await expect(score).not.toContainText('Note');

  // The page's own IELTS rubric, not the school one
  await expect(page.locator('body')).toContainText('Cause and effect language');

  // Each deliberate wrong answer shows its explanation on the review step
  const expl = page.locator('#explanations');
  await expect(expl).toContainText('the ones to review (3)');
  await expect(expl).toContainText('“Due to” is followed by a noun phrase (a date)');  // exA-g2
  await expect(expl).toContainText('“The storm” is a noun phrase');                    // exB-g3
  await expect(expl).toContainText('more computers would make it worse');             // exC-g3
  await expectNoSidewaysScroll(page);

  expect(errors).toEqual([]);
});

test('email mode: gate fields and submission payload carry email, never a name', async ({ page }) => {
  const errors = [];
  watchConsole(page, errors);

  await page.goto(PAGE);
  await expect(page.locator('#inp-email')).toBeVisible();
  await expect(page.locator('#inp-name')).toHaveCount(0);
  await expect(page.locator('#inp-class')).toHaveCount(0);
  await expect(page.locator('#inp-newsletter')).not.toBeChecked();

  await page.fill('#inp-email', 'learner@example.com');
  await page.locator('button:has-text("Start Exercises")').click();
  await expect(page.locator('#exA-g1')).toBeVisible();

  await answerSection(page, 'exA');
  await page.locator('#step-1 button:has-text("Continue")').click();
  await answerSection(page, 'exB');
  await page.locator('#step-2 button:has-text("Continue")').click();
  await answerSection(page, 'exC');
  await page.locator('#step-3 button:has-text("Continue")').click();
  await page.locator('#exD-text').fill(EX_D_TEXT);
  await page.locator('#step-4 button.btn-primary').click();

  const payloadPromise = new Promise((resolve) => {
    page.on('console', async (m) => {
      if (m.text().includes('TEST MODE - Submission payload')) {
        resolve(await m.args()[1].jsonValue());
      }
    });
  });
  await page.locator('#submit-btn').click();
  const payload = await payloadPromise;

  expect(payload.unit).toBe('ielts-writing-task2-problem-solution-essay');
  expect(payload.email).toBe('learner@example.com');
  expect(payload).toHaveProperty('newsletter');
  expect(payload.name || '').toBe('');
  expect(payload.cls || '').toBe('');
  expect(payload.exD.text).toBe(EX_D_TEXT);
  expect(payload.score).toBe('21 / 21');
  expect(payload.grade || '').toBe('');   // no German Note, ever

  expect(errors).toEqual([]);
});
