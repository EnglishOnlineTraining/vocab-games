// E2E check that the standalone class tests and uni-writing-task send the
// integrity.js counts (docs/integrity-signals-spec.md, phase 2). These pages post
// for real even on localhost, so every submission request is intercepted here and
// never leaves the machine.
const { test, expect } = require('@playwright/test');

const PAGES = [
  { file: '9g-class-test-9ab', level: 'strict', setup: "name = 'Test Student'; cls = '9g';" },
  // No free-text answers on these two: only gap-fill inputs, so no keystrokes are counted.
  { file: '9ab-grammar-literary-review-test', level: 'strict', noText: true, setup: "name = 'Test Student'; cls = '9a';" },
  { file: '10a-grammar-literary-review-test', level: 'strict', noText: true, setup: "name = 'Test Student'; cls = '10a';" },
  { file: '9c-australia-vocab-test', level: 'strict', setup: "sName = 'Test Student'; sGroup = '9c';" },
  { file: '9g-australia-vocab-test', level: 'strict', setup: "sName = 'Test Student'; sGroup = '9g';" },
  { file: 'uni-writing-task', level: 'standard',
    setup: "sName = 'Test Student'; sGroup = 'Test'; vocabCheck = () => ({ ok: true, mvF: [], rvF: [], lkF: [] });" },
];

function parseBody(body) {
  if (body.startsWith('payload=')) return JSON.parse(decodeURIComponent(body.slice(8).replace(/\+/g, ' ')));
  return JSON.parse(body);
}

for (const p of PAGES) {
  test(`${p.file} sends the integrity counts`, async ({ page }) => {
    await page.route(/hook\.eu1\.make\.com|script\.google\.com/, (route) => route.fulfill({ status: 200, body: 'OK' }));
    await page.goto(`/${p.file}.html`);
    const sent = page.waitForRequest((r) => r.method() === 'POST' && /make\.com|script\.google\.com/.test(r.url()));

    await page.evaluate((setup) => {
      (0, eval)(setup);   // the page's own globals (name/class, test stubs)
      startExam();
      const ta = [...document.querySelectorAll('textarea')].find((t) => !t.readOnly)
        || document.querySelector('input[type="text"]:not(#inp-name)');
      for (const ch of 'abc def') {
        ta.value += ch;
        ta.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: ch }));
      }
      ta.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true }));
      doSubmit();
      if (typeof submitWarned !== 'undefined' && submitWarned) doSubmit();   // "Section C not finished" asks twice
    }, p.setup);

    const payload = parseBody((await sent).postData());
    expect(payload.int_level).toBe(p.level);
    expect(payload.int_keys).toBe(p.noText ? 0 : 7);
    expect(payload.int_paste_tries).toBe(1);
    if (!p.noText) expect(payload.int_words).toBeGreaterThanOrEqual(2);
    expect(payload).not.toHaveProperty('user_agent');
  });
}

test('strict standalone copy and paste restrictions stay unchanged', async ({ page }) => {
  await page.goto('/9g-class-test-9ab.html');
  const result = await page.evaluate(() => {
    name = 'Test Student';
    cls = '9g';
    startExam();
    const answer = document.querySelector('textarea');
    const copy = new ClipboardEvent('copy', { bubbles: true, cancelable: true });
    const paste = new ClipboardEvent('paste', { bubbles: true, cancelable: true });
    document.body.dispatchEvent(copy);
    answer.dispatchEvent(paste);
    return [copy.defaultPrevented, paste.defaultPrevented, eolInt.pasteTries];
  });
  expect(result).toEqual([true, true, 1]);
});
