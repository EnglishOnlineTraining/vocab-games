const { test, expect } = require('@playwright/test');

const ORIGIN = 'http://eol.test:8791';

test.use({
  launchOptions: { args: ['--host-resolver-rules=MAP eol.test 127.0.0.1'] },
});

async function mockSubmissions(page, status = 500) {
  const state = { status, requests: [] };
  await page.route((url) => ['hook.eu1.make.com', 'script.google.com'].includes(url.hostname), async (route) => {
    state.requests.push(route.request().postData());
    await route.fulfill({
      status: state.status,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: state.status === 200 ? 'OK' : 'Unavailable',
    });
  });
  return state;
}

test('exercise.js: failure preserves the draft and only a 200 confirms and clears it', async ({ page }) => {
  const mock = await mockSubmissions(page);
  await page.goto(ORIGIN + '/8c-five-teenagers.html');
  await page.fill('#inp-name', 'Test Student');
  await page.fill('#inp-class', '8C');
  await page.locator('button:has-text("Start Exercises")').click();
  await page.evaluate(() => {
    state.exC.text = 'This draft must survive a failed submission.';
    eolDraftSave();
    showStep(TOTAL_STEPS);
    submitToSheet();
  });

  await expect(page.locator('#submit-fallback')).toBeVisible();
  await expect(page.locator('#submit-success')).toBeHidden();
  await expect(page.locator('#submit-btn')).toBeEnabled();
  await expect.poll(() => mock.requests.length).toBe(1);
  const draft = await page.evaluate(() => JSON.parse(localStorage.getItem(EOL_DRAFT_KEY)));
  expect(draft.state.exC.text).toBe('This draft must survive a failed submission.');
  await page.screenshot({ path: 'test-results/submission-response-failure.png', fullPage: true });

  mock.status = 200;
  await page.evaluate(() => submitToSheet());
  await expect(page.locator('#submit-success')).toBeVisible();
  await expect.poll(() => mock.requests.length).toBe(2);
  expect(await page.evaluate(() => localStorage.getItem(EOL_DRAFT_KEY))).toBeNull();
  await page.screenshot({ path: 'test-results/submission-response-success.png', fullPage: true });
});

for (const status of [500, 200]) {
  test(`Abitur standalone submission handles a ${status} response`, async ({ page }) => {
    const mock = await mockSubmissions(page, status);
    await page.goto('/abitur-mediation-media-impact.html');
    await page.evaluate(() => {
      document.getElementById('studentName').value = 'Test Student';
      document.getElementById('studentClass').value = 'Q1';
      document.getElementById('essayText').value = 'A draft that must not be lost.';
      document.getElementById('finalScore').style.display = 'block';   // as the page's own results step does
      submitToTeacher();
    });

    await expect.poll(() => mock.requests.length).toBe(1);
    if (status === 500) {
      await expect(page.locator('#submitFallback')).toBeVisible();
      await expect(page.locator('#submitSuccess')).toBeHidden();
      await expect(page.locator('#submitBtn')).toBeEnabled();
      await expect(page.locator('#essayText')).toHaveValue('A draft that must not be lost.');
    } else {
      await expect(page.locator('#submitSuccess')).toBeVisible();
      await expect(page.locator('#submitBtn')).toBeHidden();
    }
  });

  test(`grammar standalone submission handles a ${status} response`, async ({ page }) => {
    const mock = await mockSubmissions(page, status);
    await page.goto(ORIGIN + '/gr-present-perfect.html');
    await page.evaluate(() => {
      document.getElementById('inp-email').value = 'student@example.test';
      document.getElementById('exD-text').value = 'This writing stays on the page after an error.';
      showStep(TOTAL_STEPS);
      submitToSheet();
    });

    await expect.poll(() => mock.requests.length).toBe(1);
    if (status === 500) {
      await expect(page.locator('#submit-fallback')).toBeVisible();
      await expect(page.locator('#submit-success')).toBeHidden();
      await expect(page.locator('#submit-btn')).toBeEnabled();
      await expect(page.locator('#exD-text')).toHaveValue('This writing stays on the page after an error.');
    } else {
      await expect(page.locator('#submit-success')).toBeVisible();
    }
  });

  test(`Business needs analysis handles a ${status} response without losing its draft`, async ({ page }) => {
    const mock = await mockSubmissions(page, status);
    await page.goto('/business-needs-analysis.html');
    await page.evaluate(() => {
      state = { name: 'Test Student', writing: 'Keep this draft.' };
      persist();
      document.getElementById('consent').checked = true;
      submitForm();
    });

    await expect.poll(() => mock.requests.length).toBe(1);
    const draft = await page.evaluate(() => localStorage.getItem(STORE_KEY));
    if (status === 500) {
      await expect(page.locator('#submitMessage')).toContainText('Sending failed');
      expect(JSON.parse(draft).writing).toBe('Keep this draft.');
      await expect(page.locator('#nextBtn')).toBeEnabled();
    } else {
      await expect(page.locator('#submitMessage')).toContainText('Your answers have been sent');
      expect(draft).toBeNull();
    }
  });

  test(`level test feedback request handles a ${status} response`, async ({ page }) => {
    const mock = await mockSubmissions(page, status);
    await page.goto(ORIGIN + '/level-test.html');
    await page.evaluate(() => buildSummary());
    await page.evaluate(() => {
      document.getElementById('result-email').value = 'student@example.test';
      requestFeedback();
    });

    await expect.poll(() => mock.requests.length).toBe(1);
    if (status === 500) {
      await expect(page.locator('#email-feedback')).toContainText('could not be sent');
      await expect(page.locator('#email-send')).toBeEnabled();
      expect(await page.evaluate(() => emailSentTo)).toBe('');
    } else {
      await expect(page.locator('#email-feedback')).toContainText('Request sent');
      await expect(page.locator('#email-send')).toBeDisabled();
    }
  });

  test(`vocab-srs progress handles a ${status} response`, async ({ page }) => {
    const mock = await mockSubmissions(page, status);
    await page.goto(ORIGIN + '/10g-south-africa-vocab-practice.html');
    await page.evaluate(() => {
      startSession(); finishSession();   // the send button only appears on the end screen
      document.getElementById('inp-name').value = 'Test Student';
      sendProgress();
    });

    await expect.poll(() => mock.requests.length).toBe(1);
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem(STORE_KEY) || '{}').name)).toBeUndefined();
    if (status === 500) {
      await expect(page.locator('#send-fb')).toContainText('That did not send');
      await expect(page.locator('#send-btn')).toBeEnabled();
    } else {
      await expect(page.locator('#send-fb')).toContainText('Your teacher has your progress');
      await expect(page.locator('#send-btn')).toHaveText('Sent ✓');
    }
  });

  test(`exam.js submission fallback handles a ${status} response`, async ({ page }) => {
    const mock = await mockSubmissions(page, status);
    await page.goto('/9ab-grammar-literary-review-test.html');
    await page.evaluate(() => { show('s-review'); doSubmit(); });

    await expect.poll(() => mock.requests.length).toBe(1);
    if (status === 500) {
      await expect(page.locator('#submit-fallback')).toBeVisible();
      await expect(page.locator('#s-done')).not.toHaveClass(/active/);
      await expect(page.locator('#submit-btn')).toBeEnabled();
    } else {
      await expect(page.locator('#s-done')).toHaveClass(/active/);
      await expect(page.locator('#submit-fallback')).toBeHidden();
    }
  });

  test(`university standalone submission handles a ${status} response`, async ({ page }) => {
    const mock = await mockSubmissions(page, status);
    await page.goto('/uni-pm-vocabulary.html');
    await page.evaluate(() => doSubmit());

    await expect.poll(() => mock.requests.length).toBe(1);
    await expect(page.locator('#s-done')).toHaveClass(/active/);
    if (status === 500) {
      await expect(page.locator('#done-title')).toHaveText('Submission failed');
      await expect(page.locator('#done-message')).toContainText('has not been sent');
    } else {
      await expect(page.locator('#done-title')).toHaveText('Submitted successfully!');
      await expect(page.locator('#done-message')).toContainText('has been sent');
    }
  });
}
