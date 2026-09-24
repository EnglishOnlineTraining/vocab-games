// @ts-check
const { test, expect } = require('@playwright/test');

/*
 * E2E tests for level-test.html — the adaptive A1–C1 placement quiz.
 *
 * Architecture: a standard exercise.js framework page with:
 *   step-0: welcome (practice mode, no name/class gate)
 *   step-1: adaptive quiz — one question at a time, option buttons, auto-advance
 *   step-2: results — custom buildSummary() renders CEFR level card + exercise CTAs
 *
 * Adaptive engine:
 *   - Starts at B1 (theta=2.0, currentLevelIdx=2)
 *   - Correct → theta up, level up; wrong → theta down, level down
 *   - 20 questions total; pool of 75 (15 per level)
 *   - finalLevel() maps theta to a CEFR band
 */

const PAGE = '/level-test.html';

// ─── Helpers ───────────────────────────────────────────────────────

async function clickStart(page) {
  await page.goto(PAGE);
  await page.locator('#step-0 button').first().click();
  await expect(page.locator('#step-1')).toBeVisible();
}

async function answerCorrectly(page) {
  const correct = await page.locator('#active-q').getAttribute('data-correct');
  await page.evaluate((c) => {
    const btns = document.querySelectorAll('#q-options button.quiz-opt');
    for (const b of btns) { if (b.dataset.value === c) { b.click(); return; } }
  }, correct);
}

async function answerWrongly(page) {
  const card = page.locator('#active-q');
  const correct = await card.getAttribute('data-correct');
  const buttons = page.locator('#q-options button.quiz-opt');
  const count = await buttons.count();
  for (let i = 0; i < count; i++) {
    const val = await buttons.nth(i).getAttribute('data-value');
    if (val !== correct) {
      await buttons.nth(i).click();
      return;
    }
  }
}

async function waitForNextQuestion(page, currentNum) {
  await page.waitForFunction(
    (n) => {
      const el = document.getElementById('quiz-count');
      return el && el.textContent.trim().startsWith((n + 1) + ' /');
    },
    currentNum,
    { timeout: 5000 }
  );
}

async function answerAllCorrect(page) {
  for (let i = 1; i <= 20; i++) {
    await expect(page.locator('#active-q')).toBeVisible();
    await answerCorrectly(page);
    if (i < 20) await waitForNextQuestion(page, i);
  }
}

async function answerAllWrong(page) {
  for (let i = 1; i <= 20; i++) {
    await expect(page.locator('#active-q')).toBeVisible();
    await answerWrongly(page);
    if (i < 20) await waitForNextQuestion(page, i);
  }
}

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
    expect(title).toMatch(/A1.*C1/);
  });

  test('has sticky header with site branding and back-link', async ({ page }) => {
    await page.goto(PAGE);
    await expect(page.locator('.app-header')).toBeVisible();
    await expect(page.locator('.app-header a[href="activities.html"]')).toBeVisible();
  });

  test('page is lang="en"', async ({ page }) => {
    await page.goto(PAGE);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });
});


test.describe('Level Test — adaptive quiz flow', () => {

  test('clicking start shows step-1 with a question', async ({ page }) => {
    await clickStart(page);
    await expect(page.locator('#active-q')).toBeVisible();
    await expect(page.locator('#quiz-count')).toContainText('1 / 20');
  });

  test('question has clickable option buttons', async ({ page }) => {
    await clickStart(page);
    const options = page.locator('#q-options button.quiz-opt');
    const count = await options.count();
    expect(count).toBeGreaterThanOrEqual(2);
    for (let i = 0; i < count; i++) {
      await expect(options.nth(i)).toBeEnabled();
    }
  });

  test('correct answer shows green feedback and disables buttons', async ({ page }) => {
    await clickStart(page);
    await answerCorrectly(page);
    const fb = page.locator('#q-feedback');
    await expect(fb).toBeVisible();
    await expect(fb).toContainText('Correct');
    const buttons = page.locator('#q-options button.quiz-opt');
    const count = await buttons.count();
    for (let i = 0; i < count; i++) {
      await expect(buttons.nth(i)).toBeDisabled();
    }
  });

  test('wrong answer shows red feedback with explanation', async ({ page }) => {
    await clickStart(page);
    await answerWrongly(page);
    const fb = page.locator('#q-feedback');
    await expect(fb).toBeVisible();
    await expect(fb).toContainText('Not quite');
    const text = await fb.textContent();
    expect(text.length).toBeGreaterThan(20);
  });

  test('auto-advances to next question after answer', async ({ page }) => {
    await clickStart(page);
    await expect(page.locator('#quiz-count')).toContainText('1 / 20');
    await answerCorrectly(page);
    await waitForNextQuestion(page, 1);
    await expect(page.locator('#quiz-count')).toContainText('2 / 20');
  });

  test('progress bar advances with each question', async ({ page }) => {
    await clickStart(page);
    const barWidth = () =>
      page.locator('#quiz-bar').evaluate(el => parseFloat(el.style.width));
    expect(await barWidth()).toBe(0);
    await answerCorrectly(page);
    await waitForNextQuestion(page, 1);
    expect(await barWidth()).toBeGreaterThan(0);
  });
});


test.describe('Level Test — adaptive difficulty', () => {

  test('correct answers move difficulty upward', async ({ page }) => {
    await clickStart(page);
    const firstLevel = await page.locator('#active-q').getAttribute('data-level');
    expect(firstLevel).toBe('B1');
    await answerCorrectly(page);
    await waitForNextQuestion(page, 1);
    const secondLevel = await page.locator('#active-q').getAttribute('data-level');
    expect(secondLevel).toBe('B2');
  });

  test('wrong answers move difficulty downward', async ({ page }) => {
    await clickStart(page);
    const firstLevel = await page.locator('#active-q').getAttribute('data-level');
    expect(firstLevel).toBe('B1');
    await answerWrongly(page);
    await waitForNextQuestion(page, 1);
    const secondLevel = await page.locator('#active-q').getAttribute('data-level');
    expect(secondLevel).toBe('A2');
  });
});


test.describe('Level Test — scoring: all correct → C1', () => {
  test.setTimeout(90_000);

  test('20/20 correct gives C1 Advanced', async ({ page }) => {
    await clickStart(page);
    await answerAllCorrect(page);
    await waitForResults(page);
    const text = await page.locator('#score-display').textContent();
    expect(text).toContain('C1');
    expect(text).toContain('Advanced');
    expect(text).toContain('20 / 20');
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

  test('0/20 correct gives A1 Beginner', async ({ page }) => {
    await clickStart(page);
    await answerAllWrong(page);
    await waitForResults(page);
    const text = await page.locator('#score-display').textContent();
    expect(text).toContain('A1');
    expect(text).toContain('Beginner');
    expect(text).toContain('0 / 20');
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
    await page.waitForTimeout(300);
    const heading = page.locator('#result-heading');
    const text = await heading.textContent();
    expect(text).toContain('Test complete');
    expect(text).not.toContain('Übung abgeschlossen');
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


test.describe('Level Test — email results', () => {
  test.setTimeout(90_000);

  test('email card appears on the results screen', async ({ page }) => {
    await clickStart(page);
    await answerAllCorrect(page);
    await waitForResults(page);
    await expect(page.locator('#email-card')).toBeVisible();
    await expect(page.locator('#result-email')).toBeVisible();
    await expect(page.locator('#send-results-btn')).toBeVisible();
  });

  test('shows validation error for empty email', async ({ page }) => {
    await clickStart(page);
    await answerAllCorrect(page);
    await waitForResults(page);
    await page.locator('#send-results-btn').click();
    const fb = page.locator('#email-feedback');
    await expect(fb).toBeVisible();
    await expect(fb).toContainText('valid email');
  });

  test('shows validation error for invalid email', async ({ page }) => {
    await clickStart(page);
    await answerAllCorrect(page);
    await waitForResults(page);
    await page.locator('#result-email').fill('not-an-email');
    await page.locator('#send-results-btn').click();
    await expect(page.locator('#email-feedback')).toContainText('valid email');
  });

  test('accepts valid email and shows success (test mode)', async ({ page }) => {
    const logs = [];
    page.on('console', msg => logs.push(msg.text()));
    await clickStart(page);
    await answerAllCorrect(page);
    await waitForResults(page);
    await page.locator('#result-email').fill('student@example.com');
    await page.locator('#send-results-btn').click();
    await expect(page.locator('#email-feedback')).toContainText('Results sent');
    await expect(page.locator('#send-results-btn')).toContainText('Sent');
    // On localhost, isTestMode() logs the payload
    const payloadLog = logs.find(l => l.includes('level-test email payload'));
    expect(payloadLog).toBeTruthy();
    expect(payloadLog).toContain('student@example.com');
    expect(payloadLog).toContain('C1');
  });
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
