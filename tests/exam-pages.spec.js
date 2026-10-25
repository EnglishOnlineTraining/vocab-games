// E2E: the timed tests that run on exam.js (class tests, vocab tests, uni tests) sit a
// whole test through the real screens: register, release code, rules, answer every
// question, submit. Random and the clock are fixed, so each page sends the same thing
// every run. The test compares what was sent to the sheet and what the email and copy
// backups hold against a recorded copy (tests/exam-pages.spec.js-snapshots/), so a
// change to exam.js that alters any test's submission fails here. Nothing leaves the
// machine: every submission request is intercepted.
const { test, expect } = require('@playwright/test');

const START = new Date('2026-11-02T09:00:00Z');
const SHEETS = ['hook.eu1.make.com', 'script.google.com'];   // where the tests submit

// The words the uni writing task checks for (MV, RV, LK in the page), padded to 220 words.
const ESSAY = ('I count on my friends and we meet up after work. Although it rained, we did not sever ties; '
  + 'we tried to strengthen and restore the team. ').repeat(10).trim();

const PAGES = [
  { file: '9g-class-test-9ab', cls: '#inp-class', steps: ['goRules()', 'startExam()'], end: ['goReview()', 'doSubmit()'] },
  { file: '9ab-grammar-literary-review-test', cls: '#inp-class', steps: ['goLock()', 'checkCode()', 'startExam()'], end: ['goReview()', 'doSubmit()'] },
  { file: '10a-grammar-literary-review-test', cls: '#inp-class', steps: ['goLock()', 'checkCode()', 'startExam()'], end: ['goReview()', 'doSubmit()'] },
  { file: '9c-australia-vocab-test', cls: '#inp-group', steps: ['goRules()', 'checkCode()', 'startExam()'], panes: true, gate: 2 },
  { file: '9g-australia-vocab-test', cls: '#inp-group', steps: ['goRules()', 'checkCode()', 'startExam()'], panes: true, gate: 2 },
  { file: 'uni-pm-vocabulary', cls: '#inp-group', steps: ['goRules()', 'startExam()'], gate: 2 },
  { file: 'uni-writing-task', cls: '#inp-group', steps: ['goRules()', 'startExam()'], gate: 10, essay: true },
];

function parseBody(body) {
  if (body.startsWith('payload=')) return JSON.parse(decodeURIComponent(body.slice(8).replace(/\+/g, ' ')));
  return JSON.parse(body);
}

async function sit(page, p, { dyslexia = false, answer = '', timeUp = false } = {}) {
  const sent = [], mail = [];
  page.on('request', (r) => { if (r.url().startsWith('mailto:')) mail.push(decodeURIComponent(r.url())); });
  await page.route((url) => SHEETS.includes(url.hostname), (route) => {
    sent.push(parseBody(route.request().postData()));
    route.fulfill({ status: 200, body: 'OK' });
  });
  await page.clock.install({ time: START });
  await page.addInitScript(() => {
    let seed = 42;   // fixed random: same paper, same session id, every run
    const next = () => (seed = (seed * 1103515245 + 12345) >>> 0);
    Math.random = () => (next() % 1e6) / 1e6;
    crypto.getRandomValues = (a) => { for (let i = 0; i < a.length; i++) a[i] = next(); return a; };
    window.__out = { copy: [] };
    navigator.clipboard.writeText = (t) => { window.__out.copy.push(t); return Promise.resolve(); };
    window.alert = () => {};
  });
  await page.goto(`/${p.file}.html`);
  await page.clock.pauseAt(new Date(START.getTime() + 60 * 1000));   // time moves only when the test says so

  await page.fill('#inp-name', 'Test Student');
  await page.fill(p.cls, 'T1');
  if (dyslexia) await page.check('#inp-dyslexia');
  for (const step of p.steps) {
    if (step === 'checkCode()') await page.fill('#inp-code', await page.evaluate(() => RELEASE_CODE));
    await page.evaluate(step);
  }

  // Answer everything the same way every run: each select its last option, each radio
  // group its first choice, each text field a fixed answer.
  await page.evaluate(({ essay }) => {
    const fire = (el) => { el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); };
    document.querySelectorAll('#s-exam select').forEach((s) => { s.value = s.options[s.options.length - 1].value; fire(s); });
    const done = new Set();
    document.querySelectorAll('#s-exam input[type="radio"]').forEach((r) => { if (!done.has(r.name)) { done.add(r.name); r.checked = true; fire(r); } });
    document.querySelectorAll('#s-exam input[type="text"]').forEach((t, i) => { t.value = i % 3 ? 'drought' : 'will be living'; fire(t); });
    document.querySelectorAll('#s-exam textarea').forEach((t) => { t.value = essay || 'People in Australia like the outback and the beach a lot.'; fire(t); });
  }, { essay: p.essay ? ESSAY : '' });
  if (answer) await page.evaluate(answer);

  if (p.panes) for (const pane of ['a', 'b']) { await page.evaluate(`nextPane('${pane}')`); await page.evaluate(`nextPane('${pane}')`); }
  if (timeUp) {   // jump to the end of the test; the timer's next tick hands it in
    await page.clock.fastForward((await page.evaluate(() => EXAM_MINS)) * 60 * 1000);
    await page.clock.runFor(1000);
  }
  else {
    await page.clock.runFor(p.gate ? p.gate * 60 * 1000 + 1000 : 20 * 60 * 1000);
    for (const step of p.end || ['doSubmit()']) await page.evaluate(step);
  }
  await expect.poll(() => sent.length).toBe(1);

  // Backups: the email backup opens a mailto: link (the browser reports it as a request).
  const fn = await page.evaluate(() => (typeof doEmailBackup === 'function' ? ['doEmailBackup()', 'doCopyBackup()'] : ['submitByEmail()', 'copyAnswers()']));
  for (const f of fn) await page.evaluate(f);
  await expect.poll(() => mail.length).toBe(1);
  const out = await page.evaluate(() => window.__out);
  return { sent: sent[0], mail, copy: out.copy };
}

for (const p of PAGES) {
  test(`${p.file}: a full sitting sends the same submission as before`, async ({ page }) => {
    const got = await sit(page, p);
    // user_agent names the browser version, which differs between machines and CI
    const fixed = JSON.stringify(got, (k, v) => (k === 'user_agent' ? '<browser>' : v), 2);
    expect(fixed).toMatchSnapshot(`${p.file}.json`);
  });
}

// Every timed test gets the dyslexia box from exam.js, unticked; ticking it switches
// the page to the easier-to-read display.
for (const p of PAGES) {
  test(`${p.file}: has the dyslexia box`, async ({ page }) => {
    await page.goto(`/${p.file}.html`);
    const box = page.locator('#inp-dyslexia');
    await expect(box).not.toBeChecked();
    await expect(page.locator('label[for="inp-dyslexia"]')).toContainText('dyslexia');
    await box.check();
    await expect(page.locator('html')).toHaveClass(/exam-dyslexia/);
    expect(await page.evaluate(() => getComputedStyle(document.querySelector('main')).fontFamily)).toMatch(/^Verdana/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(await page.evaluate(() => innerWidth));   // no sideways scroll
    await box.uncheck();
    await expect(page.locator('html')).not.toHaveClass(/exam-dyslexia/);
  });
}

// Each typed answer is the right word with its last two letters swapped: one slip.
const SLIP = (w) => (w.length < 4 ? w : w.slice(0, -2) + w.slice(-1) + w.slice(-2, -1));
const VOCAB = PAGES.find((p) => p.file === '9g-australia-vocab-test');
const MISSPELL_VOCAB = `(${SLIP})&&document.querySelectorAll('.qa-input').forEach((inp, i) => {
  inp.value = (${SLIP})(fillItems[i].t.replace(/^to /, '')); inp.dispatchEvent(new Event('input', { bubbles: true })); })`;

test('dyslexia box: a spelling slip in a vocabulary answer counts, and only the sheet is told', async ({ page }) => {
  const got = await sit(page, VOCAB, { dyslexia: true, answer: MISSPELL_VOCAB });
  const fills = Object.keys(got.sent).filter((k) => /^ex\d+$/.test(k) && got.sent[k].startsWith('B '));
  expect(fills).toHaveLength(10);
  for (const k of fills) expect(got.sent[k]).toMatch(/\[correct(, spelling not marked: [^\]]+)?\]$/);
  expect(Number(got.sent.score.split(' ')[0])).toBeGreaterThanOrEqual(10);
  expect(got.sent.dyslexia).toBe('yes');
  expect(got.sent.ex27).toContain('dyslexia=yes');   // the integrity slot: Q_TOTAL + USE_N + 2
  expect(got.mail.join('') + got.copy.join('')).not.toMatch(/dyslexi/i);
});

test('without the box, the same spelling slips are marked wrong', async ({ page }) => {
  const got = await sit(page, VOCAB, { answer: MISSPELL_VOCAB });
  const fills = Object.keys(got.sent).filter((k) => /^ex\d+$/.test(k) && got.sent[k].startsWith('B '));
  expect(fills.filter((k) => /\[wrong/.test(got.sent[k])).length).toBeGreaterThan(0);
  expect(JSON.stringify(got.sent)).not.toMatch(/dyslexi|spelling not marked/i);
});

test('dyslexia box on a class test: vocabulary spelling is not marked, grammar still is', async ({ page }) => {
  const p = PAGES.find((x) => x.file === '9g-class-test-9ab');
  const answer = `(() => { const slip = ${SLIP}; const fire = (el) => el.dispatchEvent(new Event('input', { bubbles: true }));
    for (let i = 1; i <= 7; i++) { const el = document.getElementById('s3b-' + i); el.value = slip(S3B_KEY[i]); fire(el); }
    for (let i = 1; i <= 10; i++) { const el = document.getElementById('s4-' + i); el.value = slip(S4_KEY[i]); fire(el); } })()`;
  const got = await sit(page, p, { dyslexia: true, answer });
  expect(got.sent.ex9).toContain('Gap-fill 7/7');
  expect(got.sent.ex9).toContain('Future tenses 0/10');
  expect(got.sent.ex10).toContain('dyslexia=yes');
  expect(got.sent.dyslexia).toBe('yes');
  expect(got.mail.join('') + got.copy.join('')).not.toMatch(/dyslexi/i);
});

test('exam.js signals: paste and leaving the tab are counted, and time-up hands the test in', async ({ page }) => {
  const p = PAGES.find((x) => x.file === '9c-australia-vocab-test');
  const answer = `(() => { const inp = document.querySelector('.qa-input');
    inp.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true }));
    window.dispatchEvent(new Event('blur')); })()`;
  const got = await sit(page, p, { answer, timeUp: true });
  await expect(page.locator('#pa-disp')).toHaveText('1');
  await expect(page.locator('#ts-disp')).toHaveText('1');
  const integrity = got.sent.ex25;   // Q_TOTAL + USE_N + 2 on this page (USE_N = 3)
  expect(integrity).toContain('tab-switches 1');
  expect(integrity).toContain('paste 1');
});

test('exam.js timer: a class test is handed in when the time runs out', async ({ page }) => {
  const p = PAGES.find((x) => x.file === '10a-grammar-literary-review-test');
  const got = await sit(page, p, { timeUp: true });
  expect(got.sent.unit).toBe('10a-grammar-literary-review-test');
  await expect(page.locator('#s-done')).toHaveClass(/active/);
});

test('a vocab test resumed after a reload keeps the dyslexia arrangement', async ({ page }) => {
  await page.goto('/9c-australia-vocab-test.html');
  await page.fill('#inp-name', 'Test Student');
  await page.fill('#inp-group', 'T1');
  await page.check('#inp-dyslexia');
  await page.evaluate(() => { goRules(); document.getElementById('inp-code').value = RELEASE_CODE; checkCode(); startExam(); });
  await page.reload();
  await expect(page.locator('html')).not.toHaveClass(/exam-dyslexia/);
  await page.click('#resume-card .btn-primary');
  await expect(page.locator('html')).toHaveClass(/exam-dyslexia/);
  expect(await page.evaluate(() => dyslexia)).toBe(true);
});
