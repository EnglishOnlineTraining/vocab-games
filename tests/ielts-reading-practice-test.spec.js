// E2E check for ielts-reading-practice-test.html (backlog Tier 14 item 1).
// The full test is marked once, at the end, from the answer key (no Check buttons), and
// the score card shows an estimated band anchored to ielts.org's published averages.
// Covers: no Check buttons, the optional timer, blanks allowed via the skip box, 30/40 →
// "about 7–7.5" with the source link and no Note, one explanation per missed question,
// answers locked after marking, no writing self-check, no sideways scroll at 375px, a
// clean console, and the email-only submission payload.
const { test, expect } = require('@playwright/test');

const PAGE = '/ielts-reading-practice-test.html';

// 8 wrong + 2 blank → 30 / 40 marks.
const WRONG = ['exA-g1', 'exA-g7', 'exA-g12', 'exB-g2', 'exB-g8', 'exB-g12', 'exC-g3', 'exC-g6'];
const BLANK = ['exC-g11', 'exC-g14'];

function watchConsole(page, errors) {
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
}

// Fill every gap from the page's own answer key (EXPLAIN), with the chosen wrong/blank ones.
async function answerAll(page, wrong = [], blank = []) {
  await page.evaluate(({ wrong, blank }) => {
    for (const [sk, sec] of Object.entries(window.EXPLAIN)) {
      const prefix = sec.prefix || sk + '-';
      for (const [gk, gv] of Object.entries(sec.gaps)) {
        const id = prefix + gk;
        const el = document.getElementById(id);
        if (blank.includes(id)) { el.value = ''; continue; }
        if (wrong.includes(id)) {
          el.value = el.tagName === 'SELECT'
            ? [...el.options].find((o) => o.value && o.value !== gv.correct).value
            : 'wrong answer';
        } else {
          el.value = gv.correct;
        }
      }
    }
  }, { wrong, blank });
}

async function finish(page) {
  for (const n of [1, 2, 3]) {
    await page.locator(`#step-${n} button.btn-primary`).click();
    const go = page.locator('#eol-skip-go');
    if (await go.isVisible().catch(() => false)) await go.click();
  }
}

async function expectNoSidewaysScroll(page) {
  const width = await page.evaluate(() =>
    Math.max(document.documentElement.scrollWidth, document.body.scrollWidth));
  expect(width).toBeLessThanOrEqual(375);
}

test('practise mode: marked once at the end, estimated band, explanations, locked, 375px', async ({ page }) => {
  const errors = [];
  watchConsole(page, errors);
  await page.setViewportSize({ width: 375, height: 800 });

  await page.goto(`${PAGE}?mode=practise`);
  await expect(page.locator('#exA-g1')).toBeVisible();
  await expect(page.locator('button[onclick^="checkEx"]')).toHaveCount(0);   // no Check buttons
  await expectNoSidewaysScroll(page);

  // Optional timer
  await page.locator('#timer-btn').click();
  await expect(page.locator('#test-timer')).toBeVisible();
  await expect(page.locator('#test-timer')).toContainText(/59:5\d|60:00/);

  await answerAll(page, WRONG, BLANK);
  await finish(page);

  const score = page.locator('#score-display');
  await expect(score).toBeVisible();
  await expect(score).toContainText('30 / 40 marks');
  await expect(score).toContainText('Estimated band: about 7–7.5');
  await expect(score).toContainText('rough guide');
  await expect(score.locator('a[href*="ielts.org"]')).toHaveCount(1);
  await expect(score).not.toContainText('Note');

  // Every wrong or blank question is explained
  await expect(page.locator('#explanations')).toContainText('the ones to review (10)');
  await expect(page.locator('#explanations')).toContainText('sat on and pushed along the ground');   // exA-g1

  // Breakdown by passage, no writing self-check, answers locked
  await expect(page.locator('#practise-results')).toContainText('Passage 3');
  await expect(page.locator('.eol-rubric')).toHaveCount(0);
  const unlocked = await page.evaluate(() =>
    [...document.querySelectorAll('.gap-select, .gap-input')].filter((e) => !e.disabled).length);
  expect(unlocked).toBe(0);
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

  await answerAll(page);
  await finish(page);
  await expect(page.locator('#score-display')).toContainText('40 / 40 marks');
  await expect(page.locator('#score-display')).toContainText('about 8 or higher');

  const payloadPromise = new Promise((resolve) => {
    page.on('console', async (m) => {
      if (m.text().includes('TEST MODE - Submission payload')) {
        resolve(await m.args()[1].jsonValue());
      }
    });
  });
  await page.locator('#submit-btn').click();
  const payload = await payloadPromise;

  expect(payload.unit).toBe('ielts-reading-practice-test');
  expect(payload.email).toBe('learner@example.com');
  expect(payload).toHaveProperty('newsletter');
  expect(payload.name || '').toBe('');
  expect(payload.cls || '').toBe('');
  expect(payload.score).toBe('40 / 40');
  expect(payload.grade || '').toBe('');   // no German Note, ever

  expect(errors).toEqual([]);
});
