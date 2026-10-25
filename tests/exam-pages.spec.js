// E2E: the timed tests that run on exam.js (class tests, vocab tests, uni tests) sit a
// whole test through the real screens: register, release code, rules, answer every
// question, submit. Random and the clock are fixed, so each page sends the same thing
// every run. The test compares what was sent to the sheet and what the email and copy
// backups hold against a recorded copy (tests/exam-pages.spec.js-snapshots/), so a
// change to exam.js that alters any test's submission fails here. Nothing leaves the
// machine: every submission request is intercepted.
const { test, expect } = require('@playwright/test');

const START = new Date('2026-11-02T09:00:00Z');

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

async function sit(page, p, { dyslexia = false } = {}) {
  const sent = [], mail = [];
  page.on('request', (r) => { if (r.url().startsWith('mailto:')) mail.push(decodeURIComponent(r.url())); });
  await page.route(/hook\.eu1\.make\.com|script\.google\.com/, (route) => {
    sent.push(parseBody(route.request().postData()));
    route.fulfill({ status: 200, body: 'OK' });
  });
  await page.clock.install({ time: START });
  await page.addInitScript(() => {
    let seed = 42;   // fixed random: same paper, same session id, every run
    Math.random = () => ((seed = (seed * 1103515245 + 12345) >>> 0) % 1e6) / 1e6;
    crypto.getRandomValues = (a) => { for (let i = 0; i < a.length; i++) a[i] = Math.floor(Math.random() * 2 ** 32) >>> 0; return a; };
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

  if (p.panes) for (const pane of ['a', 'b']) { await page.evaluate(`nextPane('${pane}')`); await page.evaluate(`nextPane('${pane}')`); }
  if (p.gate) await page.clock.runFor(p.gate * 60 * 1000 + 1000);
  else await page.clock.runFor(20 * 60 * 1000);
  for (const step of p.end || ['doSubmit()']) await page.evaluate(step);
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
    expect(JSON.stringify(got, null, 2)).toMatchSnapshot(`${p.file}.json`);
  });
}
