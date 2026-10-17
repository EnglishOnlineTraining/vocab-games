// E2E check for ielts-writing-task1-tables-bar-charts.html (B3 of the ielts-exercise-draft skill).
// Covers the skill's browser-check list: every Check button, a deliberate wrong answer per
// section surfacing its explanation, the English-only score card (points (N%), no Note), the
// IELTS writing rubric, no sideways scroll at 375px, a clean console, and the email-only
// submission payload.
const { test, expect } = require('@playwright/test');

const PAGE = '/ielts-writing-task1-tables-bar-charts.html';

const OVERVIEW = 'Overall, travel habits differed widely, with driving most common in Country A, cycling in Country B and public transport in Countries C and D.';
const NUMBERS_ONLY = 'In Country A, 48% of students drove, 30% took public transport, 6% cycled and 16% walked.';

const CORRECT = {
  exA: { g1: 'whereas', g2: 'four times', g3: 'just under half', g4: 'the highest proportion', g5: 'compared with', g6: 'just over a quarter', g7: 'the same proportion', g8: 'slightly higher than' },
  exB: { g1: 'just over a quarter', g2: 'almost half', g3: 'three times as many', g4: 'nearly three quarters', g5: 'roughly a third', g6: 'just over half', g7: 'fewer than one in ten', g8: 'half as many' },
  exC: {
    g1: OVERVIEW,
    g2: 'Overall, the Science museum attracted far more visitors than the other two.',
    g3: 'Overall, the older the students were, the more time they spent on homework.',
    g4: 'Overall, younger adults preferred online news, while older adults read newspapers far more.',
    g5: 'from',
    g6: 'slight fall',
  },
};

const EX_D_TEXT = 'The table compares the share of household spending that went on housing, food and transport in four countries in one year. Overall, housing was the largest expense in three of the four countries, whereas food took the biggest share in Country Q. Housing accounted for just over a third of spending in Country P (35%) and roughly a third in Country R (30%). By contrast, Country Q spent the least on housing, at 22%, but the most on food, at 28%, which was more than twice the figure for Country S (12%). Transport was the smallest category in every country except Country S, where it reached a fifth of spending.';

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
  await expectNoSidewaysScroll(page);   // the chart and the table fit a phone

  // Ex A — one deliberate wrong answer (48% vs 12% is not "twice")
  await answerSection(page, 'exA', { gap: 'g2', value: 'twice' });
  await page.locator('#step-1 button:has-text("Check")').click();
  await expect(page.locator('#step1-fb')).toContainText('7 / 8 correct');
  await expect(page.locator('#exA-g2')).toHaveClass(/gap-wrong/);
  await page.locator('#step-1 button:has-text("Continue")').click();

  // Ex B — one deliberate wrong answer
  await answerSection(page, 'exB', { gap: 'g5', value: 'roughly a quarter' });
  await page.locator('#step-2 button:has-text("Check")').click();
  await expect(page.locator('#step2-fb')).toContainText('7 / 8 correct');
  await page.locator('#step-2 button:has-text("Continue")').click();

  // Ex C — one deliberate wrong answer: a list of numbers instead of an overview
  await answerSection(page, 'exC', { gap: 'g1', value: NUMBERS_ONLY });
  await page.locator('#step-3 button:has-text("Check")').click();
  await expect(page.locator('#step3-fb')).toContainText('5 / 6 correct');
  await page.locator('#step-3 button:has-text("Continue")').click();

  // Ex D — free writing, then review
  await page.locator('#exD-text').fill(EX_D_TEXT);
  await page.locator('#step-4 button.btn-primary').click();

  // Score card: points (N%), the IELTS band note, and no German Note
  const score = page.locator('#score-display');
  await expect(score).toBeVisible();
  await expect(score).toContainText('19 / 22 points (86%)');
  await expect(score).toContainText('band');
  await expect(score).not.toContainText('Note');

  // The page's own IELTS rubric, not the school one
  await expect(page.locator('body')).toContainText('Comparison language');

  // Each deliberate wrong answer shows its explanation on the review step
  const expl = page.locator('#explanations');
  await expect(expl).toContainText('the ones to review (3)');
  await expect(expl).toContainText('48% is four times 12%');                // exA-g2
  await expect(expl).toContainText('A third is about 33%');                 // exB-g5
  await expect(expl).toContainText('An overview names the main features');  // exC-g1
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

  expect(payload.unit).toBe('ielts-writing-task1-tables-bar-charts');
  expect(payload.email).toBe('learner@example.com');
  expect(payload).toHaveProperty('newsletter');
  expect(payload.name || '').toBe('');
  expect(payload.cls || '').toBe('');
  expect(payload.exD.text).toBe(EX_D_TEXT);
  expect(payload.score).toBe('22 / 22');
  expect(payload.grade || '').toBe('');   // no German Note, ever

  expect(errors).toEqual([]);
});
