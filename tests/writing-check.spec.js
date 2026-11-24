// E2E for the live writing checklist (exercise.js eolWritingCheck): a textarea with
// data-min-words gets a word / paragraph / linking-word line that updates as you type.
// Artifact: test-results/writing-check.png (the IELTS Task 2 box with the line under it).
const { test, expect } = require('@playwright/test');

test('writing checklist counts words, paragraphs and linking words', async ({ page }) => {
  await page.route('**/script.google.com/**', (r) => r.abort());
  await page.goto('/ielts-writing-task2-opinion-essay.html?mode=practise');
  const line = page.locator('#exD-text + .eol-wcheck');
  await expect(line).toHaveText('0 / 250 words · 0 paragraphs · 0 linking words');

  const set = (v) => page.evaluate((v) => {
    const ta = document.getElementById('exD-text');
    ta.value = v; ta.dispatchEvent(new Event('input'));
  }, v);

  await set('Cars are a problem. However, buses help.\n\nTherefore free transport works, for example in Tallinn.');
  await expect(line).toHaveText('15 / 250 words · 2 paragraphs · 3 linking words');

  await set(Array(250).fill('word').join(' '));
  await expect(line).toHaveText('✓ 250 / 250 words · 1 paragraph · 0 linking words');

  await page.evaluate(() => {   // show step 4 for the artifact screenshot
    document.querySelectorAll('.step').forEach((s) => s.classList.remove('active'));
    document.getElementById('exD-text').closest('.step').classList.add('active');
  });
  await page.locator('#exD-text').screenshot({ path: 'test-results/writing-check.png' }).catch(() => {});
});
