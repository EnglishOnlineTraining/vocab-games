// E2E check for ielts-reading-sentence-summary-completion.html (B2 of the ielts-exercise-draft skill).
// Covers the skill's browser-check list: every Check button, a deliberate wrong answer per
// section surfacing its explanation (including an answer over the word limit), the English-only
// score card (points (N%), no Note), no sideways scroll at 375px, a clean console, and the
// email-only submission payload.
const { test, expect } = require('@playwright/test');

const PAGE = '/ielts-reading-sentence-summary-completion.html';

// Questions 1-7 are typed; everything else is a select.
const TYPED = { g1: 'landraces', g2: 'pest', g3: 'chemical processes', g4: 'germinate', g5: 'several', g6: '18', g7: 'meltwater' };
const CORRECT = {
  exA: { g8: 'duplicate', g9: 'conflict', g10: 'dried', g11: 'inconsistent', g12: 'adapt', g13: 'complementary' },
  exB: { g1: 'an adjective', g2: 'a noun', g3: 'a verb form', g4: 'an adjective', g5: 'a verb form', g6: 'an adjective' },
  exC: { g1: 'airtight packets', g2: 'recalcitrant', g3: 'duplicate copies', g4: 'adapting', g5: 'costly', g6: 'Not Given', g7: 'a trap' },
};

const EX_D_TEXT = "You wrote 'chemical processes of ageing' for Question 3, but the instruction said NO MORE THAN TWO WORDS AND/OR A NUMBER, so a four-word answer loses the mark even though the meaning is right. The answer is 'chemical processes', copied exactly from paragraph B. Always copy the words from the text, because changing them can make the spelling or grammar wrong. My tip: count the words in your answer, then read the whole sentence again to check it still makes sense.";

function watchConsole(page, errors) {
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
}

async function answerTyped(page, wrong) {
  for (const [gap, value] of Object.entries(TYPED)) {
    await page.fill(`#exA-${gap}`, wrong && wrong.gap === gap ? wrong.value : value);
  }
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

test('practise mode: checks, explanations, score card, 375px, clean console', async ({ page }) => {
  const errors = [];
  watchConsole(page, errors);
  await page.setViewportSize({ width: 375, height: 800 });

  await page.goto(`${PAGE}?mode=practise`);
  await expect(page.locator('#exA-g1')).toBeVisible();

  // Ex A — one deliberate wrong answer: the right words, but over the two-word limit
  await answerTyped(page, { gap: 'g3', value: 'chemical processes of ageing' });
  await answerSection(page, 'exA');
  await page.locator('#step-1 button:has-text("Check")').click();
  await expect(page.locator('#step1-fb')).toContainText('12 / 13 correct');
  await expect(page.locator('#exA-g3')).toHaveClass(/gap-wrong/);
  await expectNoSidewaysScroll(page);
  await page.locator('#step-1 button:has-text("Continue")').click();

  // Ex B — one deliberate wrong answer
  await answerSection(page, 'exB', { gap: 'g4', value: 'a noun' });
  await page.locator('#step-2 button:has-text("Check")').click();
  await expect(page.locator('#step2-fb')).toContainText('5 / 6 correct');
  await page.locator('#step-2 button:has-text("Continue")').click();

  // Ex C — one deliberate wrong answer (the spaced-recall item)
  await answerSection(page, 'exC', { gap: 'g6', value: 'False' });
  await page.locator('#step-3 button:has-text("Check")').click();
  await expect(page.locator('#step3-fb')).toContainText('6 / 7 correct');
  await page.locator('#step-3 button:has-text("Continue")').click();

  // Ex D — free writing, then review
  await page.locator('#exD-text').fill(EX_D_TEXT);
  await page.locator('#step-4 button.btn-primary').click();

  // Score card: points (N%), the IELTS band note, and no German Note
  const score = page.locator('#score-display');
  await expect(score).toBeVisible();
  await expect(score).toContainText('23 / 26 points (88%)');
  await expect(score).toContainText('band');
  await expect(score).not.toContainText('Note');

  // Each deliberate wrong answer shows its explanation on the review step
  const expl = page.locator('#explanations');
  await expect(expl).toContainText('the ones to review (3)');
  await expect(expl).toContainText('breaks the limit');                       // exA-g3
  await expect(expl).toContainText('describes the technique');                // exB-g4
  await expect(expl).toContainText('ielts-reading-true-false-not-given.html'); // exC-g6 spaced recall, labelled
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

  await answerTyped(page);
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

  expect(payload.unit).toBe('ielts-reading-sentence-summary-completion');
  expect(payload.email).toBe('learner@example.com');
  expect(payload).toHaveProperty('newsletter');
  expect(payload.name || '').toBe('');
  expect(payload.cls || '').toBe('');
  expect(payload.exA.g6).toBe('18');
  expect(payload.score).toBe('26 / 26');
  expect(payload.grade || '').toBe('');   // no German Note, ever

  expect(errors).toEqual([]);
});
