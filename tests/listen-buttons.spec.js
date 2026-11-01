// @ts-check
const { test, expect } = require('@playwright/test');

/*
 * E2E for the 🔊 listen buttons (eolSayBtn / eolSpeak in exercise.js).
 * Speech is stubbed, so the test reads what would be spoken: the text, en-GB,
 * and the British voice when the device has one. Checks: every word in a static
 * word list gets a button; the SRS word list does too; in the SRS typing round
 * the button appears only after the answer, never before; with no voices the
 * buttons hide.
 * Artifact: test-results/listen-buttons-list.png (a word list with its buttons).
 */

function stubSpeech(voices) {
  return page => page.addInitScript(vs => {
    window.__spoken = [];
    window.SpeechSynthesisUtterance = function(text) { this.text = text; };
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: {
      getVoices: () => vs,
      cancel() {},
      speak(u) { window.__spoken.push({ text: u.text, lang: u.lang, voice: u.voice && u.voice.name }); },
      addEventListener() {},
    } });
  }, voices);
}
const VOICES = [{ lang: 'en-US', name: 'US voice' }, { lang: 'en-GB', name: 'GB voice' }];

test('static word list: every word has a button, and it speaks the word in British English', async ({ page }) => {
  await stubSpeech(VOICES)(page);
  await page.goto('/9c-australia-vocab-practice.html?mode=practise');   // the list is on step 1
  const cells = page.locator('td.wl-en');
  const n = await cells.count();
  expect(n).toBeGreaterThan(10);
  await expect(page.locator('td.wl-en .say-btn')).toHaveCount(n);
  const first = page.locator('td.wl-en').first();
  const word = (await first.evaluate(td => td.firstChild.textContent)).trim();
  await first.locator('.say-btn').click();
  expect(await page.evaluate(() => window.__spoken)).toEqual([{ text: word, lang: 'en-GB', voice: 'GB voice' }]);
  await page.locator('.wl-table').screenshot({ path: 'test-results/listen-buttons-list.png' });
});

test('SRS: list buttons, and in the typing round the word is heard only after answering', async ({ page }) => {
  await stubSpeech(VOICES)(page);
  await page.goto('/uni-c1-vocab-practice.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  const total = await page.evaluate(() => WORDS.length);
  await expect(page.locator('#wordlist .say-btn')).toHaveCount(total);

  await page.click('text=Start a 10-word session');
  await page.evaluate(() => { S.round = 2; S.queue = S.words.slice(); showCard(); });
  await expect(page.locator('#scr-round .say-btn')).toHaveCount(0);
  const word = await page.evaluate(() => S.queue[0]);
  await page.fill('#typed', 'not the word');
  await page.click('#check-btn');
  const btn = page.locator('#fb .say-btn');
  await expect(btn).toHaveAttribute('data-say', word);
  await btn.click();
  expect((await page.evaluate(() => window.__spoken.pop())).text).toBe(word.replace(/ \/ /g, ', '));
});

test('SRS: "A / B" words are read with a pause, not "slash"', async ({ page }) => {
  await stubSpeech(VOICES)(page);
  await page.goto('/uni-c2-vocab-practice.html');
  await page.locator('details:has(#wordlist) summary').click();   // the list is folded away
  await page.locator('#wordlist .say-btn[data-say="On the Beach / On the Bench"]').click();
  expect((await page.evaluate(() => window.__spoken.pop())).text).toBe('On the Beach, On the Bench');
});

test('no voices on the device: the buttons hide', async ({ page }) => {
  await stubSpeech([])(page);
  await page.goto('/9c-australia-vocab-practice.html');
  await expect(page.locator('html')).toHaveClass(/no-voices/, { timeout: 5000 });
  await expect(page.locator('td.wl-en .say-btn').first()).toBeHidden();
});
