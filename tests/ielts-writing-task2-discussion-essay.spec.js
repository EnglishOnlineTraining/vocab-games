// E2E check for ielts-writing-task2-discussion-essay.html (B5 of the ielts-exercise-draft skill).
// Covers the skill's browser-check list: every Check button, a deliberate wrong answer per
// section surfacing its explanation, the English-only score card (points (N%), no Note), the
// IELTS writing rubric, no sideways scroll at 375px, a clean console, and the email-only
// submission payload.
const { test, expect } = require('@playwright/test');

const PAGE = '/ielts-writing-task2-discussion-essay.html';

const C1 = 'In conclusion, although charging would raise money, I believe free entry is better because museums exist to share knowledge.';
const NO_OPINION = 'In conclusion, there are good arguments on both sides, and people will always disagree about this.';

const CORRECT = {
  exA: { g1: 'Supporters of', g2: 'It is also claimed that', g3: 'On the other hand', g4: 'Critics of free entry also argue that', g5: 'In conclusion', g6: 'I would therefore argue that' },
  exB: { g1: 'Supporters of homework', g2: 'Critics', g3: 'It is often claimed', g4: 'In my view', g5: 'believe', g6: 'I agree with', g7: 'suggest', g8: 'While it is true' },
  exC: {
    g1: C1,
    g2: 'To sum up, while starting early has some benefits, I believe most children gain more from starting at seven, when they are ready to learn.',
    g3: 'To conclude, although offices help teamwork, in my view most employees work best with a mix of home and office days.',
    g4: 'In conclusion, I believe a small tourist tax is fair, as long as the money is spent on the places that visitors use.',
    g5: 'Despite',
    g6: 'As a result',
  },
};

const EX_D_TEXT = 'Choosing a career is one of the biggest decisions a young person makes. Some people think young people should follow their interests, while others believe they should choose work that is useful to society. This essay will discuss both views, but I believe enjoyment matters most. Supporters of free choice argue that people who enjoy their work stay motivated and become skilled. On the other hand, critics point out that society needs nurses, engineers and teachers. In conclusion, while useful jobs are important, in my view young people should choose work they enjoy.';

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

  // Ex A — one deliberate wrong answer: the conclusion only reports others again
  await answerSection(page, 'exA', { gap: 'g6', value: 'Some people therefore argue that' });
  await page.locator('#step-1 button:has-text("Check")').click();
  await expect(page.locator('#step1-fb')).toContainText('5 / 6 correct');
  await expect(page.locator('#exA-g6')).toHaveClass(/gap-wrong/);
  await page.locator('#step-1 button:has-text("Continue")').click();

  // Ex B — one deliberate wrong answer: a reported view where your own is asked for
  await answerSection(page, 'exB', { gap: 'g4', value: 'Many people argue' });
  await page.locator('#step-2 button:has-text("Check")').click();
  await expect(page.locator('#step2-fb')).toContainText('7 / 8 correct');
  await page.locator('#step-2 button:has-text("Continue")').click();

  // Ex C — one deliberate wrong answer: a conclusion with no opinion
  await answerSection(page, 'exC', { gap: 'g1', value: NO_OPINION });
  await page.locator('#step-3 button:has-text("Check")').click();
  await expect(page.locator('#step3-fb')).toContainText('5 / 6 correct');
  await page.locator('#step-3 button:has-text("Continue")').click();

  // Ex D — free writing, then review
  await page.locator('#exD-text').fill(EX_D_TEXT);
  await page.locator('#step-4 button.btn-primary').click();

  // Score card: points (N%), the IELTS band note, and no German Note
  const score = page.locator('#score-display');
  await expect(score).toBeVisible();
  await expect(score).toContainText('17 / 20 points (85%)');
  await expect(score).toContainText('band');
  await expect(score).not.toContainText('Note');

  // The page's own IELTS rubric, not the school one
  await expect(page.locator('body')).toContainText('Reporting language');

  // Each deliberate wrong answer shows its explanation on the review step
  const expl = page.locator('#explanations');
  await expect(expl).toContainText('the ones to review (3)');
  await expect(expl).toContainText('The conclusion must give the writer’s own view');  // exA-g6
  await expect(expl).toContainText('“Many people argue” reports someone else’s');     // exB-g4
  await expect(expl).toContainText('the first option has no opinion');               // exC-g1
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

  expect(payload.unit).toBe('ielts-writing-task2-discussion-essay');
  expect(payload.email).toBe('learner@example.com');
  expect(payload).toHaveProperty('newsletter');
  expect(payload.name || '').toBe('');
  expect(payload.cls || '').toBe('');
  expect(payload.exD.text).toBe(EX_D_TEXT);
  expect(payload.score).toBe('20 / 20');
  expect(payload.grade || '').toBe('');   // no German Note, ever

  expect(errors).toEqual([]);
});
