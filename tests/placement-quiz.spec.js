// @ts-check
const { test, expect } = require('@playwright/test');

/*
 * E2E tests for level-test.html — the adaptive A1–C1 placement quiz.
 *
 * Format modelled on taketest.xyz:
 *   step-0: intro (eyebrow, explainer paragraphs, single Begin button)
 *   step-1: one question at a time — click an option to select it, confirm
 *           with "Keep answer →"; no right/wrong shown during the test;
 *           counting-up timer; "N of at most 20" counter
 *   step-2: results (shown instantly) — CEFR card, per-level breakdown,
 *           mistake review, CTAs, optional "extra feedback by email" card
 *
 * Adaptive engine:
 *   - Starts at B1 (theta = 2.0); item selection = unused question whose
 *     level is closest to theta ("most informative at your estimated level")
 *   - Surprise-weighted theta update (right-on-hard / wrong-on-easy move more),
 *     with the step shrinking as the test goes on
 *   - Level = band theta sits in (B1 = 2.0–2.99); boundaries at 1/2/3/4
 *   - Stops at 15 questions unless theta is within 0.35 of a level boundary
 *     (then runs to 20)
 */

const PAGE = '/level-test.html';

// ─── Helpers ───────────────────────────────────────────────────────

async function clickStart(page) {
  await page.goto(PAGE);
  await page.locator('#step-0 button').first().click();
  await expect(page.locator('#step-1')).toBeVisible();
}

// Click an option button, then confirm with "Keep answer →". Everything is
// synchronous — after the keep click the next question (or the results step)
// is already rendered.
async function selectAndKeep(page, value) {
  await page.evaluate((v) => {
    const btns = document.querySelectorAll('#q-options button.quiz-opt');
    for (const b of btns) { if (b.dataset.value === v) { b.click(); return; } }
  }, value);
  await page.locator('#quiz-keep').click();
}

async function answerCorrectly(page) {
  const correct = await page.locator('#active-q').getAttribute('data-correct');
  await selectAndKeep(page, correct);
}

async function answerWrongly(page) {
  const correct = await page.locator('#active-q').getAttribute('data-correct');
  const buttons = page.locator('#q-options button.quiz-opt');
  const count = await buttons.count();
  for (let i = 0; i < count; i++) {
    const val = await buttons.nth(i).getAttribute('data-value');
    if (val !== correct) { await selectAndKeep(page, val); return; }
  }
}

// Answer until the results step appears. All-correct runs stop at 15
// questions, all-wrong at 15 — anything past 25 means the stop rule broke.
async function answerUntilResults(page, how) {
  for (let i = 0; i < 25; i++) {
    if (await page.locator('#step-2').isVisible().catch(() => false)) return;
    await expect(page.locator('#active-q')).toBeVisible();
    await how(page);
  }
  throw new Error('quiz did not reach the results within 25 questions');
}

async function answerAllCorrect(page) { await answerUntilResults(page, answerCorrectly); }
async function answerAllWrong(page)   { await answerUntilResults(page, answerWrongly); }

// Results appear straight after the last answer — no interstitial.
async function waitForResults(page) {
  await expect(page.locator('#step-2')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('#score-display')).toBeVisible({ timeout: 3000 });
}


// ─── Tests ─────────────────────────────────────────────────────────

test.describe('Level Test — welcome screen', () => {

  test('shows step-0 with start button, no name/class required', async ({ page }) => {
    await page.goto(PAGE);
    await expect(page.locator('#step-0')).toBeVisible();
    await expect(page.locator('#step-1')).not.toBeVisible();
    await expect(page.locator('#step-2')).not.toBeVisible();
    const requiredInputs = page.locator('#step-0 input[required]');
    await expect(requiredInputs).toHaveCount(0);
  });

  test('page title mentions level test and CEFR', async ({ page }) => {
    await page.goto(PAGE);
    const title = await page.title();
    expect(title).toContain('Level Test');
    expect(title).toContain('CEFR');
  });

  test('has sticky header with site branding and back-link', async ({ page }) => {
    await page.goto(PAGE);
    await expect(page.locator('.app-header')).toBeVisible();
    await expect(page.locator('.header-logo').first()).toContainText('englishonline.training');
  });

  test('page is lang="en"', async ({ page }) => {
    await page.goto(PAGE);
    expect(await page.locator('html').getAttribute('lang')).toBe('en');
  });
});


test.describe('Level Test — question flow', () => {

  test('clicking start shows step-1 with a question', async ({ page }) => {
    await clickStart(page);
    await expect(page.locator('#active-q')).toBeVisible();
    await expect(page.locator('#q-options .quiz-opt').first()).toBeVisible();
  });

  test('question has clickable option buttons', async ({ page }) => {
    await clickStart(page);
    const buttons = page.locator('#q-options .quiz-opt');
    await expect(buttons).toHaveCount(3);
    for (let i = 0; i < 3; i++) await expect(buttons.nth(i)).toBeEnabled();
  });

  test('selecting an option highlights it and reveals Keep answer', async ({ page }) => {
    await clickStart(page);
    await expect(page.locator('#quiz-keep')).toBeHidden();
    const first = page.locator('#q-options .quiz-opt').first();
    await first.click();
    await expect(page.locator('#quiz-keep')).toBeVisible();
    const bg = await first.evaluate(el => el.style.background);
    expect(bg).toContain('gold');
  });

  test('no right/wrong feedback is shown during the test', async ({ page }) => {
    await clickStart(page);
    await answerCorrectly(page);
    // Still on question 2 area: no feedback element, no green/red painting
    await expect(page.locator('#q-feedback')).toHaveCount(0);
    const painted = await page.evaluate(() => {
      return [...document.querySelectorAll('#q-options .quiz-opt')]
        .some(b => b.style.background.includes('green') || b.style.background.includes('red'));
    });
    expect(painted).toBe(false);
  });

  test('Keep answer advances to the next question', async ({ page }) => {
    await clickStart(page);
    await expect(page.locator('#quiz-count')).toContainText('1 of at most');
    await answerCorrectly(page);
    await expect(page.locator('#active-q .card-title')).toContainText('Question 2');
    await expect(page.locator('#quiz-count')).toContainText('2 of at most');
  });

  test('progress bar advances with each question', async ({ page }) => {
    await clickStart(page);
    for (let i = 0; i < 3; i++) await answerCorrectly(page);
    const width = await page.locator('#quiz-bar').evaluate(el => parseFloat(el.style.width));
    expect(width).toBeGreaterThan(0);
  });

  test('timer is shown next to the question counter', async ({ page }) => {
    await clickStart(page);
    await expect(page.locator('#quiz-timer')).toHaveText('0:00');
  });
});


test.describe('Level Test — adaptive difficulty', () => {

  test('correct answers move difficulty upward', async ({ page }) => {
    await clickStart(page);
    const firstLevel = await page.locator('#active-q').getAttribute('data-level');
    expect(firstLevel).toBe('B1');
    await answerCorrectly(page);
    const secondLevel = await page.locator('#active-q').getAttribute('data-level');
    expect(secondLevel).toBe('B2');
  });

  test('wrong answers move difficulty downward', async ({ page }) => {
    await clickStart(page);
    const firstLevel = await page.locator('#active-q').getAttribute('data-level');
    expect(firstLevel).toBe('B1');
    await answerWrongly(page);
    const secondLevel = await page.locator('#active-q').getAttribute('data-level');
    expect(secondLevel).toBe('A2');
  });
});


test.describe('Level Test — scoring: all correct → C1', () => {
  test.setTimeout(90_000);

  test('an all-correct run gives C1 Advanced', async ({ page }) => {
    await clickStart(page);
    await answerAllCorrect(page);
    await waitForResults(page);
    const text = await page.locator('#score-display').textContent();
    expect(text).toContain('C1');
    expect(text).toContain('Advanced');
    // A clean run is far from every boundary, so the test stops at 15
    expect(text).toContain('15 / 15');
  });

  test('C1 result shows exercise CTA links', async ({ page }) => {
    await clickStart(page);
    await answerAllCorrect(page);
    await waitForResults(page);
    const hrefs = await page.locator('#score-display a[href]').evaluateAll(
      els => els.map(e => e.getAttribute('href'))
    );
    expect(hrefs.some(h => h.includes('quiz-grammar-hardest'))).toBe(true);
    expect(hrefs.some(h => h.includes('abitur-activities'))).toBe(true);
    expect(hrefs.some(h => h.includes('uni-activities'))).toBe(true);
  });
});


test.describe('Level Test — scoring: all wrong → A1', () => {
  test.setTimeout(90_000);

  test('an all-wrong run gives A1 Beginner', async ({ page }) => {
    await clickStart(page);
    await answerAllWrong(page);
    await waitForResults(page);
    const text = await page.locator('#score-display').textContent();
    expect(text).toContain('A1');
    expect(text).toContain('Beginner');
    expect(text).toContain('0 / 15');
  });

  test('A1 result shows beginner-appropriate CTAs', async ({ page }) => {
    await clickStart(page);
    await answerAllWrong(page);
    await waitForResults(page);
    const hrefs = await page.locator('#score-display a[href]').evaluateAll(
      els => els.map(e => e.getAttribute('href'))
    );
    expect(hrefs.some(h => h.includes('present-tenses'))).toBe(true);
    expect(hrefs.some(h => h.includes('quiz-grammar-easy'))).toBe(true);
  });
});


test.describe('Level Test — result screen content', () => {
  test.setTimeout(90_000);

  test('shows per-level breakdown', async ({ page }) => {
    await clickStart(page);
    await answerAllCorrect(page);
    await waitForResults(page);
    const text = await page.locator('#score-display').textContent();
    expect(text).toContain('Your performance by level');
  });

  test('shows disclaimer about grammar-based estimate', async ({ page }) => {
    await clickStart(page);
    await answerAllCorrect(page);
    await waitForResults(page);
    const text = await page.locator('#score-display').textContent();
    expect(text).toMatch(/grammar.based estimate/i);
  });

  test('shows "Take the test again" button', async ({ page }) => {
    await clickStart(page);
    await answerAllCorrect(page);
    await waitForResults(page);
    await expect(
      page.locator('#score-display button:has-text("Take the test again")')
    ).toBeVisible();
  });

  test('shows wrong-answer review when answers are wrong', async ({ page }) => {
    await clickStart(page);
    await answerAllWrong(page);
    await waitForResults(page);
    const review = page.locator('#summary-container');
    await expect(review).toBeVisible();
    const text = await review.textContent();
    expect(text).toContain('Review your mistakes');
    expect(text).toContain('You chose:');
  });

  test('wrong-answer review renders HTML correctly, not as raw tags', async ({ page }) => {
    await clickStart(page);
    await answerAllWrong(page);
    await waitForResults(page);
    const container = page.locator('#summary-container');
    const strongCount = await container.locator('strong').count();
    expect(strongCount).toBeGreaterThan(0);
    const text = await container.textContent();
    expect(text).not.toContain('<strong>');
  });

  test('two-gap items put each part of the answer in its own gap', async ({ page }) => {
    await clickStart(page);
    await page.evaluate(() => {
      answered = [
        { question: POOL.B2[0], level: 'B2', levelIdx: 3, correct: false, selected: 'has … started' },
        { question: POOL.B1[8], level: 'B1', levelIdx: 2, correct: false, selected: 'such … that' }
      ];
      finishQuiz();
    });
    const text = await page.locator('#summary-container').textContent();
    expect(text).toContain('When I arrived, the film had already started.');
    expect(text).toContain('The film was so boring that I fell asleep.');
    expect(text).not.toContain('___');
  });
});


test.describe('Level Test — framework interaction', () => {
  test.setTimeout(90_000);

  test('custom CEFR card is NOT overwritten by renderScore', async ({ page }) => {
    await clickStart(page);
    await answerAllCorrect(page);
    await waitForResults(page);
    await page.waitForTimeout(500);
    const text = await page.locator('#score-display').textContent();
    expect(text).toContain('C1');
    expect(text).toContain('estimated level');
    expect(text).not.toContain('Your score (auto-graded sections)');
  });

  test('step-2 heading stays in English, not overwritten to German', async ({ page }) => {
    await clickStart(page);
    await answerAllCorrect(page);
    await waitForResults(page);
    await page.waitForTimeout(500);
    await expect(page.locator('#result-heading')).toContainText('Test complete!');
  });
});


test.describe('Level Test — no data submission', () => {
  test.setTimeout(90_000);

  test('no POST requests are made to any webhook or sheet', async ({ page }) => {
    const posts = [];
    page.on('request', req => {
      if (req.method() === 'POST') posts.push(req.url());
    });
    await clickStart(page);
    await answerAllCorrect(page);
    await waitForResults(page);
    const webhookPosts = posts.filter(
      url => url.includes('make.com') || url.includes('google.com/macros')
    );
    expect(webhookPosts).toHaveLength(0);
  });
});


test.describe('Level Test — optional extra feedback by email', () => {
  test.setTimeout(90_000);

  test('results appear straight after the last question, with the email card below', async ({ page }) => {
    await clickStart(page);
    await answerAllCorrect(page);
    await waitForResults(page);
    await expect(page.locator('#result-email')).toBeVisible();
    await expect(page.locator('#email-send')).toBeVisible();
    await expect(page.locator('#score-display')).toContainText('Get extra feedback by email');
  });

  test('invalid email shows a validation error and sends nothing', async ({ page }) => {
    const logs = [];
    page.on('console', msg => logs.push(msg.text()));
    await clickStart(page);
    await answerAllCorrect(page);
    await page.locator('#result-email').fill('not-an-email');
    await page.locator('#email-send').click();
    const fb = page.locator('#email-feedback');
    await expect(fb).toBeVisible();
    await expect(fb).toContainText('valid email');
    await expect(page.locator('#email-send')).toBeEnabled();
    expect(logs.find(l => l.includes('level-test email payload'))).toBeFalsy();
  });

  test('valid email sends the feedback payload once (test mode)', async ({ page }) => {
    const logs = [];
    page.on('console', msg => logs.push(msg.text()));
    await clickStart(page);
    await answerAllWrong(page);
    await page.locator('#result-email').fill('student@example.com');
    await page.locator('#email-send').click();
    await expect(page.locator('#email-feedback')).toContainText('student@example.com');
    await expect(page.locator('#email-send')).toBeDisabled();
    // On localhost, isTestMode() logs the payload instead of POSTing
    const payloadLogs = logs.filter(l => l.includes('level-test email payload'));
    expect(payloadLogs).toHaveLength(1);
    const payload = JSON.parse(payloadLogs[0].slice(payloadLogs[0].indexOf('{')));
    expect(payload.email).toBe('student@example.com');
    expect(payload.level).toBe('A1');
    expect(payload.answers.length).toBeGreaterThanOrEqual(15);
    // Only ids and chosen options — the Apps Script writes the email text.
    expect(Object.keys(payload).sort()).toEqual(['answers', 'email', 'level', 'unit']);
  });

  test('after sending, revisiting the results keeps the card in its sent state', async ({ page }) => {
    await clickStart(page);
    await answerAllWrong(page);
    await page.locator('#result-email').fill('student@example.com');
    await page.locator('#email-send').click();
    await page.locator('#step-nav button', { hasText: 'Ex A' }).click();
    await page.locator('#step-nav button', { hasText: 'Submit' }).click();
    await expect(page.locator('#step-2')).toBeVisible();
    await expect(page.locator('#result-email')).toBeDisabled();
    await expect(page.locator('#result-email')).toHaveValue('student@example.com');
    await expect(page.locator('#email-send')).toBeDisabled();
    await expect(page.locator('#email-feedback')).toContainText('Request sent to student@example.com');
  });

  test('the Apps Script carries the same question pool and level advice as the page', async ({ page }) => {
    const fs = require('fs'), vm = require('vm'), path = require('path');
    const ctx = {};
    vm.createContext(ctx);
    vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'level-test-apps-script.gs'), 'utf8'), ctx);
    await page.goto(PAGE);
    const fromPage = await page.evaluate(() => JSON.stringify({ POOL, LEVELS }));
    expect(JSON.stringify({ POOL: ctx.POOL, LEVELS: ctx.LEVELS })).toBe(fromPage);
  });

  test('not requesting feedback sends nothing', async ({ page }) => {
    const logs = [];
    page.on('console', msg => logs.push(msg.text()));
    await clickStart(page);
    await answerAllWrong(page);
    await waitForResults(page);
    expect(logs.find(l => l.includes('level-test email payload'))).toBeFalsy();
  });
});


test.describe('Level Test — step nav after finishing', () => {
  test.setTimeout(90_000);

  test('going back to the quiz step shows no live question or form', async ({ page }) => {
    await clickStart(page);
    await answerAllCorrect(page);
    await waitForResults(page);
    await page.locator('#step-nav button', { hasText: 'Ex A' }).click();
    await expect(page.locator('#step-1')).toBeVisible();
    await expect(page.locator('#active-q')).toHaveCount(0);
    await expect(page.locator('#quiz-card')).toContainText('Test finished');
  });
});


test.describe('Level Test — level placement', () => {
  test.setTimeout(90_000);

  // A learner who gets every A1 item right and every harder item wrong is A1,
  // and one who masters A2 but nothing above is A2 — the old engine placed
  // both one level too high.
  for (const [mastered, expected] of [['A1', 'A1'], ['A2', 'A2'], ['B1', 'B1'], ['B2', 'B2']]) {
    test(`a learner who masters up to ${mastered} is placed at ${expected}`, async ({ page }) => {
      const order = ['A1', 'A2', 'B1', 'B2', 'C1'];
      await clickStart(page);
      await answerUntilResults(page, async (p) => {
        const lvl = await p.locator('#active-q').getAttribute('data-level');
        if (order.indexOf(lvl) <= order.indexOf(mastered)) await answerCorrectly(p);
        else await answerWrongly(p);
      });
      await waitForResults(page);
      const text = await page.locator('#score-display').textContent();
      expect(text).toContain('Your estimated level');
      expect(text).toMatch(new RegExp(expected + ' — '));
    });
  }
});


test.describe('Level Test — randomization', () => {

  test('two runs can produce different first questions', async ({ page }) => {
    const ids = [];
    for (let run = 0; run < 5; run++) {
      await page.goto(PAGE);
      await page.locator('#step-0 button').first().click();
      await expect(page.locator('#active-q')).toBeVisible();
      ids.push(await page.locator('#active-q').getAttribute('data-id'));
    }
    // With 15 B1 questions, 5 runs should produce at least 2 distinct ids
    const unique = new Set(ids);
    expect(unique.size).toBeGreaterThanOrEqual(2);
  });
});
