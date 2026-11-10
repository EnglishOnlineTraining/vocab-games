// The submit card sits at the top of the final step, above the score, answers and explanations,
// and is on screen without scrolling. One page per layout of that step.
const { test, expect } = require('@playwright/test');

const PAGES = [
  '9g-australia-causatives-progressive.html', // standard
  '7c-robert-the-bruce.html',                 // no score card
  '9g-australia-vocab-practice.html',         // focus words
  '10c-london-slang.html',                    // score + summary wrapped in a card
  'it-working-in-it.html',                    // email card above the submit card
  'esl-question-formation.html',              // email + newsletter card
  'gr-reported-speech.html',                  // email inside the submit card
  'be-meetings-schedules.html',               // "check my answers" button first
];

for (const file of PAGES) {
  test(file, async ({ page }) => {
    await page.route(/^https?:\/\/(?!localhost)/, r => r.abort());
    await page.goto('/' + file + '?mode=class');
    const order = await page.evaluate(() => {
      showStep(TOTAL_STEPS);
      if (typeof buildSummary === 'function') buildSummary();
      const btn = document.getElementById('submit-btn');
      const below = id => {
        const el = document.getElementById(id);
        return !el || !!(btn.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING);
      };
      const email = document.querySelector('#step-' + TOTAL_STEPS + ' input[type="email"]');
      return {
        score: below('score-display'), summary: below('summary-container'), explanations: below('explanations'),
        emailAboveBtn: !email || !!(btn.compareDocumentPosition(email) & Node.DOCUMENT_POSITION_PRECEDING),
      };
    });
    expect(order).toEqual({ score: true, summary: true, explanations: true, emailAboveBtn: true });
    await page.waitForTimeout(600); // showStep scrolls smoothly to the top
    const box = await page.locator('#submit-btn').boundingBox();
    expect(box.y + box.height).toBeLessThan(page.viewportSize().height);
  });
}

test('practise mode hides the feedback email box along with the submit card', async ({ page }) => {
  await page.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  await page.goto('/it-working-in-it.html?mode=practise');
  await page.evaluate(() => showStep(TOTAL_STEPS));
  await expect(page.locator('#submit-btn')).toBeHidden();
  await expect(page.locator('#inp-email')).toBeHidden();
});
