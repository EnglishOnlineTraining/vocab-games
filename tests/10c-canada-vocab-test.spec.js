// E2E: 10c-canada-vocab-test (built by eol-vocab-quiz-creator Format B, school options).
// Section B shows a box with exactly its own answer words. A sitting answered
// correctly, with B typed without "to" / sb / sth, scores 25/25 with Note 1 and is sent
// once to the Year 9 Make webhook (intercepted, never leaves the machine).
const { test, expect } = require('@playwright/test');

const FILE = '/10c-canada-vocab-test.html';

test('the Section B box lists exactly the Section B answers', async ({ page }) => {
  await page.goto(FILE);
  for (let i = 0; i < 20; i++) {
    const r = await page.evaluate(() => {
      buildQuestions();
      const box = [...document.querySelectorAll('#b-wordbox span')].map((s) => s.textContent);
      return { box: box.slice().sort(), fill: fillItems.map((x) => x.t).sort(), hidden: document.getElementById('b-wordbox').hidden };
    });
    expect(r.hidden).toBe(false);
    expect(r.box).toEqual(r.fill);
  }
});

test('a correct sitting scores 25/25, Note 1, and is sent once to Make', async ({ page }) => {
  const sent = [];
  await page.route(/hook\.eu1\.make\.com/, (route) => {
    sent.push(JSON.parse(decodeURIComponent(route.request().postData().slice(8).replace(/\+/g, ' '))));
    route.fulfill({ status: 200, body: 'Accepted' });
  });
  await page.clock.install({ time: new Date('2026-11-13T09:00:00Z') });
  await page.goto(FILE);
  await page.fill('#inp-name', 'Test Student');
  await page.fill('#inp-group', '10c');
  await page.evaluate(() => goRules());
  await page.fill('#inp-code', 'can10c2026');
  await page.evaluate(() => checkCode());
  await page.evaluate(() => startExam());
  await page.evaluate(() => {
    const fire = (el) => el.dispatchEvent(new Event('input', { bubbles: true }));
    document.querySelectorAll('.qa-select').forEach((s, i) => { s.value = matchItems[i].t; fire(s); });
    // the shortest accepted form: "skate" for "to skate", "be sick of" for "to be sick of sth"
    document.querySelectorAll('.qa-input').forEach((inp, i) => {
      inp.value = forms(fillItems[i].t).sort((a, b) => a.length - b.length)[0]; fire(inp);
    });
    document.querySelectorAll('#use-list textarea').forEach((t, i) => {
      t.value = 'Yesterday we talked about ' + forms(useItems[i].t)[0] + ' in our English lesson.'; fire(t);
    });
  });
  for (const pane of ['a', 'b']) { await page.evaluate(`nextPane('${pane}')`); await page.evaluate(`nextPane('${pane}')`); }
  await page.clock.runFor(2 * 60 * 1000 + 1000);
  await page.evaluate(() => doSubmit());

  const results = () => sent.filter((x) => x.unit === '10c-canada-vocab-test');
  await expect.poll(() => results().length).toBe(1);
  const p = results()[0];
  // the start has its own Unit, so Make's one-row-per-class+name+unit+day rule cannot drop the result
  const logs = sent.filter((x) => x.unit !== '10c-canada-vocab-test');
  expect(logs).toHaveLength(1);
  expect(logs[0].unit).toMatch(/^10c-canada-vocab-test-log started SID-/);
  expect(logs[0].score).toBe('LOG STARTED (not a result)');
  expect(p.unit).toBe('10c-canada-vocab-test');
  expect(p.cls).toBe('10c');
  expect(p.score).toMatch(/^25 \/ 25 \(100%\)/);
  expect(p.grade).toMatch(/^Note 1 /);
  expect(p.ex31).toContain('5 / 5');
  expect(p.ex32).toMatch(/^integrity \| /);
  expect(p.ex33).toBeUndefined();
  await expect(page.locator('#done-meta')).toContainText('Note 1');
});

test('school forms: without "to", optional bracket, sb/sth, and Section C with "am"', async ({ page }) => {
  await page.goto(FILE);
  const r = await page.evaluate(() => {
    const by = (t) => VOCAB_BANK.find((x) => x.t === t);
    const ok = (t, g) => typedForms(by(t)).includes(vnorm(g));
    return [
      ok('to skate', 'skate'), ok('to skate', 'to skate'),
      ok('to rely (on)', 'rely'), ok('to rely (on)', 'rely on'),
      ok('to be sick of sth', 'be sick of'), ok('to be sick of sth', 'to be sick of something'),
      ok('challenging', 'demanding'), ok('to skate', 'on'),
      checkUse(by('to be sick of sth'), 'I am really sick of rainy weekends in November.').ok,
      checkUse(by('to rely (on)'), 'You can always rely on your best friend at school.').ok,
    ];
  });
  expect(r).toEqual([true, true, true, true, true, false, true, false, true, true]);
});

test('the same student gets the same paper, whatever the spacing and case', async ({ page }) => {
  await page.goto(FILE);
  const r = await page.evaluate(() => {
    const paper = (n, g) => { sName = n; sGroup = g; buildQuestions(); return JSON.stringify([matchItems, fillItems, useItems].map((a) => a.map((x) => x.t))); };
    return [paper('Lena Müller', '10c'), paper('lena mueller', '10C'), paper('Lena  MÜLLER', '10C '), paper('Tom Becker', '10c')];
  });
  expect(r[2]).toBe(r[0]);
  expect(r[3]).not.toBe(r[0]);
});
