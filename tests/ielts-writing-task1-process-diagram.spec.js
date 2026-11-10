// E2E check for ielts-writing-task1-process-diagram.html (B4 of the ielts-exercise-draft skill).
// Covers the skill's browser-check list: every Check button, a deliberate wrong answer per
// section surfacing its explanation, the English-only score card (points (N%), no Note), the
// IELTS writing rubric, no sideways scroll at 375px, a clean console, and the email-only
// submission payload.
const { test, expect } = require('@playwright/test');

const PAGE = '/ielts-writing-task1-process-diagram.html';

const CORRECT = {
  exA: { g1: 'are then taken', g2: 'are sorted', g3: 'Once', g4: 'After that', g5: 'is crushed', g6: 'are mixed', g7: 'is then shaped', g8: 'Finally' },
  exB: { g1: 'are collected', g2: 'is crushed', g3: 'have been sorted', g4: 'is then heated', g5: 'are removed', g6: 'rises', g7: 'are filled', g8: 'is made' },
  exC: { g1: 'First', g2: 'Once', g3: 'After that', g4: 'At the next stage', g5: 'before being', g6: 'When', g7: 'to', g8: 'whereas' },
};

const EX_D_TEXT = 'The diagram shows how paper is made from wood. Overall, the process has eight stages, beginning with cutting down trees and ending with the finished paper being wound onto large reels. First, trees are cut down and the logs are taken to a paper mill. Once the bark has been removed, the wood is cut into small chips. At the next stage, these chips are cooked with water and chemicals to make pulp, which is then washed. After that, the pulp is spread out, pressed and dried on heated rollers. Finally, the paper is wound onto reels, ready to be sent to customers.';

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
  await expectNoSidewaysScroll(page);   // the diagram fits a phone

  // Ex A — one deliberate wrong answer (active "then take" where the passive is needed)
  await answerSection(page, 'exA', { gap: 'g1', value: 'then take' });
  await page.locator('#step-1 button:has-text("Check")').click();
  await expect(page.locator('#step1-fb')).toContainText('7 / 8 correct');
  await expect(page.locator('#exA-g1')).toHaveClass(/gap-wrong/);
  await page.locator('#step-1 button:has-text("Continue")').click();

  // Ex B — one deliberate wrong answer: a passive for the natural process
  await answerSection(page, 'exB', { gap: 'g6', value: 'is raised' });
  await page.locator('#step-2 button:has-text("Check")').click();
  await expect(page.locator('#step2-fb')).toContainText('7 / 8 correct');
  await page.locator('#step-2 button:has-text("Continue")').click();

  // Ex C — one deliberate wrong answer
  await answerSection(page, 'exC', { gap: 'g4', value: 'Lastly' });
  await page.locator('#step-3 button:has-text("Check")').click();
  await expect(page.locator('#step3-fb')).toContainText('7 / 8 correct');
  await page.locator('#step-3 button:has-text("Continue")').click();

  // Ex D — free writing, then review
  await page.locator('#exD-text').fill(EX_D_TEXT);
  await page.locator('#step-4 button.btn-primary').click();

  // Score card: points (N%), the IELTS band note, and no German Note
  const score = page.locator('#score-display');
  await expect(score).toBeVisible();
  await expect(score).toContainText('21 / 24 points (88%)');
  await expect(score).toContainText('band');
  await expect(score).not.toContainText('Note');

  // The page's own IELTS rubric, not the school one
  await expect(page.locator('body')).toContainText('Stages in order');

  // Each deliberate wrong answer shows its explanation on the review step
  const expl = page.locator('#explanations');
  await expect(expl).toContainText('the ones to review (3)');
  await expect(expl).toContainText('The bottles do not move themselves');   // exA-g1
  await expect(expl).toContainText('A natural process with no human agent'); // exB-g6
  await expect(expl).toContainText('Cleaning follows sorting directly');     // exC-g4
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

  expect(payload.unit).toBe('ielts-writing-task1-process-diagram');
  expect(payload.email).toBe('learner@example.com');
  expect(payload).toHaveProperty('newsletter');
  expect(payload.name || '').toBe('');
  expect(payload.cls || '').toBe('');
  expect(payload.exD.text).toBe(EX_D_TEXT);
  expect(payload.score).toBe('24 / 24');
  expect(payload.grade || '').toBe('');   // no German Note, ever

  expect(errors).toEqual([]);
});
