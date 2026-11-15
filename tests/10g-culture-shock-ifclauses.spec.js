// E2E check for 10g-culture-shock-ifclauses.html (daily-exercise-draft skill).
// Covers the skill's browser-check list: every Check button, one deliberate wrong
// answer per section surfacing its explanation on the review step, the score card
// with the German Note, no sideways scroll at 375px, a clean console, and the
// test-mode submission payload carrying unit, score and grade.
const { test, expect } = require('@playwright/test');

const PAGE = '/10g-culture-shock-ifclauses.html';

const CORRECT = {
  exA: {
    g1: 'She had learned the language and read guidebooks',
    g2: 'Please sit down — no help was needed',
    g3: 'She watched people instead of translating everything',
    g4: 'With soft, polite phrases instead of direct questions',
    g5: 'An inverted if-clause — the “if” is dropped',
    g6: 'A gerund after the verb “remember”',
  },
  exB: {
    g1: 'move', g2: 'wouldn’t have bought', g3: 'paid', g4: 'practise',
    g5: 'wouldn’t have felt', g6: 'feel', g7: 'would have missed', g8: 'would be',
  },
  exC: {
    g1: 'Would', g2: 'tell', g3: 'could', g4: 'taking',
    g5: 'Would', g6: 'could', g7: 'to open', g8: 'as',
  },
};

const EX_D_TEXT = 'Dear Hana, welcome to our class! If you feel lost in the first weeks, do not worry — that is completely normal. If I were you, I would watch people carefully first and ask questions later. Could you please tell me if anything confuses you? If you give it time, the new routines will start to feel like home. See you soon!';

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

test('practise mode: checks, explanations, score card with Note, 375px, clean console', async ({ page }) => {
  const errors = [];
  watchConsole(page, errors);
  await page.setViewportSize({ width: 375, height: 800 });

  await page.goto(`${PAGE}?mode=practise`);
  await expect(page.locator('#exA-g1')).toBeVisible();
  await expectNoSidewaysScroll(page);

  // Ex A — one deliberate wrong answer: the polite surface meaning of "It's fine"
  await answerSection(page, 'exA', { gap: 'g2', value: 'She was happy to have some help' });
  await page.locator('#step-1 button:has-text("Check")').click();
  await expect(page.locator('#step1-fb')).toContainText('5 / 6 correct');
  await expect(page.locator('#exA-g2')).toHaveClass(/gap-wrong/);
  await page.locator('#step-1 button:has-text("Continue")').click();

  // Ex B — one deliberate wrong answer: present instead of past in an unreal condition
  await answerSection(page, 'exB', { gap: 'g3', value: 'pays' });
  await page.locator('#step-2 button:has-text("Check")').click();
  await expect(page.locator('#step2-fb')).toContainText('7 / 8 correct');
  await page.locator('#step-2 button:has-text("Continue")').click();

  // Ex C — one deliberate wrong answer: bare verb instead of -ing after "Would you mind"
  await answerSection(page, 'exC', { gap: 'g4', value: 'take' });
  await page.locator('#step-3 button:has-text("Check")').click();
  await expect(page.locator('#step3-fb')).toContainText('7 / 8 correct');
  await page.locator('#step-3 button:has-text("Continue")').click();

  // Ex D — free writing, then the results step
  await page.locator('#exD-response').fill(EX_D_TEXT);
  await page.locator('#step-4 button.btn-gold').click();

  // Score card: 19 / 22 first-try points plus the German Note
  const score = page.locator('#score-display');
  await expect(score).toBeVisible();
  await expect(score).toContainText('19 / 22 points');
  await expect(score).toContainText('Note');

  // Each deliberate wrong answer shows its explanation on the review step
  const expl = page.locator('#explanations');
  await expect(expl).toContainText('the ones to review (3)');
  await expect(expl).toContainText('actually meant “Please sit down”');        // exA-g2
  await expect(expl).toContainText('if + past simple');                        // exB-g3
  await expect(expl).toContainText('followed by the -ing form');               // exC-g4
  await expectNoSidewaysScroll(page);

  expect(errors).toEqual([]);
});

test('class mode: test-mode payload carries unit, score, grade and all sections', async ({ page }) => {
  const errors = [];
  watchConsole(page, errors);

  await page.goto(PAGE);
  await page.fill('#inp-name', 'Test Learner');
  await page.fill('#inp-class', '10g');
  await page.locator('button:has-text("Start Exercises")').click();
  await expect(page.locator('#exA-g1')).toBeVisible();

  await answerSection(page, 'exA');
  await page.locator('#step-1 button:has-text("Check")').click();
  await page.locator('#step-1 button:has-text("Continue")').click();
  await answerSection(page, 'exB');
  await page.locator('#step-2 button:has-text("Check")').click();
  await page.locator('#step-2 button:has-text("Continue")').click();
  await answerSection(page, 'exC');
  await page.locator('#step-3 button:has-text("Check")').click();
  await page.locator('#step-3 button:has-text("Continue")').click();
  await page.locator('#exD-response').fill(EX_D_TEXT);
  await page.locator('#step-4 button.btn-gold').click();

  const payloadPromise = new Promise((resolve) => {
    page.on('console', async (m) => {
      if (m.text().includes('TEST MODE - Submission payload')) {
        resolve(await m.args()[1].jsonValue());
      }
    });
  });
  await page.locator('#submit-btn').click();
  const payload = await payloadPromise;

  expect(payload.unit).toBe('10g-culture-shock-ifclauses');
  expect(payload.name).toBe('Test Learner');
  expect(payload.cls).toBe('10g');
  expect(payload.score).toBe('22 / 22');
  expect(payload.grade).toContain('Note');
  for (const sec of ['exA', 'exB', 'exC', 'exD']) expect(payload).toHaveProperty(sec);
  expect(String(payload.exA)).toContain('g1:');
  expect(JSON.stringify(payload.exD)).toContain('Dear Hana');

  expect(errors).toEqual([]);
});
