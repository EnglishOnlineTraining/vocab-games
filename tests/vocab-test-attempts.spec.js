// E2E: the paper contract and the attempt log of the generated vocab tests
// (eol-vocab-quiz-creator Format B). Pins down, for every page:
//   - which spellings of a name and class count as the same student (same paper),
//     and which deliberately do not;
//   - a restart after a reload gives the same paper and logs started / left /
//     abandoned / started, with no result;
//   - a resumed test submits exactly ONE result, under the original session, and
//     its log records never collide with that result.
// Make and Apps Script are intercepted: nothing leaves the machine.
const { test, expect } = require('@playwright/test');

const PAGES = [
  { file: 'uni-c1-vocab-test', to: 'sheet' },
  { file: 'uni-c2-vocab-test', to: 'sheet' },
  { file: '10c-canada-vocab-test', to: 'make' },
];

function body(raw) {
  return raw.startsWith('payload=') ? JSON.parse(decodeURIComponent(raw.slice(8).replace(/\+/g, ' '))) : JSON.parse(raw);
}

async function intercept(page) {
  const sent = [];
  await page.route((url) => ['script.google.com', 'hook.eu1.make.com'].includes(url.hostname), (route) => {
    sent.push(body(route.request().postData()));
    route.fulfill({ status: 200, body: 'OK' });
  });
  return sent;
}

async function start(page, name, group) {
  await page.fill('#inp-name', name);
  await page.fill('#inp-group', group);
  await page.evaluate(() => goRules());
  await page.fill('#inp-code', await page.evaluate(() => RELEASE_CODE));
  await page.evaluate(() => checkCode());
  await page.evaluate(() => startExam());
  return page.evaluate(() => ({ sid, fill: fillItems.map((x) => x.t), match: matchItems.map((x) => x.t), use: useItems.map((x) => x.t) }));
}

for (const P of PAGES) {
  const result = (x) => x.unit === P.file;
  // sheet: a `<unit>-log` tab with an `event` field; Make: Unit `<unit>-log <event> <session>`
  const event = (x) => (P.to === 'sheet' ? x.event : x.unit.split(' ')[1]);
  const logs = (sent) => sent.filter((x) => !result(x));

  test(`${P.file}: which names and classes count as the same student`, async ({ page }) => {
    await page.goto(`/${P.file}.html`);
    const r = await page.evaluate(() => {
      const same = (a, b) => keyPart(a) === keyPart(b);
      const paper = (n, g) => { sName = n; sGroup = g; buildQuestions(); return fillItems.map((x) => x.t).join('|') + '#' + matchOptions.join('|'); };
      const other = seededRandom(seedFrom(UNIT + '|ANOTHERCODE|jose|class a'))();
      return {
        // the same student: case, spacing, accents, punctuation
        same: [same('  José ', 'jose'), same('Class A', 'class-a'), same('Maria  Schmidt', 'maria schmidt'),
          same('Zoë', 'zoe'), same('10c', ' 10C '), same('Anne-Marie', 'anne marie')],
        // deliberately different students: a different spelling or order is a different name
        different: [same('Lena Müller', 'Lena Mueller'), same('Maria Schmidt', 'Schmidt, Maria'), same('10c', '10b')],
        paperSame: paper('  José ', 'Class A') === paper('jose', 'class-a'),
        paperOther: paper('  José ', 'Class A') !== paper('Tom Becker', 'Class A'),
        codeChangesPaper: paperRandom('jose', 'class a')() !== other,
      };
    });
    expect(r.same).toEqual([true, true, true, true, true, true]);
    expect(r.different).toEqual([false, false, false]);
    expect(r.paperSame).toBe(true);
    expect(r.paperOther).toBe(true);
    expect(r.codeChangesPaper).toBe(true);
  });

  test(`${P.file}: a restart after a reload gives the same paper and is logged, with no result`, async ({ page }) => {
    const sent = await intercept(page);
    await page.goto(`/${P.file}.html`);
    const first = await start(page, '  José ', 'Class A');
    await page.evaluate(() => window.dispatchEvent(new Event('pagehide')));   // what closing the window fires
    await page.reload();
    await expect(page.locator('#resume-card')).toBeVisible();   // the device offers the open test…
    const second = await start(page, 'jose', 'class-a');          // …the student registers again instead
    expect(second.fill).toEqual(first.fill);
    expect(second.match).toEqual(first.match);
    expect(second.use).toEqual(first.use);
    expect(second.sid).not.toBe(first.sid);

    await expect.poll(() => logs(sent).map(event)).toEqual(['started', 'left', 'abandoned', 'started']);
    expect(sent.filter(result)).toHaveLength(0);
    const started = logs(sent).filter((x) => event(x) === 'started');
    const words = (x) => (P.to === 'sheet' ? x.detail : x.ex1).split('B words: ')[1];
    expect(words(started[1])).toBe(words(started[0]));   // the teacher can see it was the same paper
  });

  test(`${P.file}: a resumed test submits exactly one result under the original session`, async ({ page }) => {
    const sent = await intercept(page);
    await page.clock.install({ time: new Date('2026-11-13T09:00:00Z') });
    await page.goto(`/${P.file}.html`);
    const first = await start(page, 'Test Student', 'T1');
    await page.evaluate(() => {
      const fire = (el) => el.dispatchEvent(new Event('input', { bubbles: true }));
      document.querySelectorAll('.qa-select').forEach((s, i) => { s.value = matchItems[i].t; fire(s); });
      document.querySelectorAll('.qa-input').forEach((inp, i) => { inp.value = forms(fillItems[i].t)[0]; fire(inp); });
      document.querySelectorAll('#use-list textarea').forEach((t, i) => { t.value = 'Yesterday we talked about ' + forms(useItems[i].t)[0] + ' in our English lesson.'; fire(t); });
    });
    await page.evaluate(() => window.dispatchEvent(new Event('pagehide')));
    await page.reload();
    await page.evaluate(() => resumeExam(loadState()));
    const resumed = await page.evaluate(() => ({ sid, fill: fillItems.map((x) => x.t), answered: answeredCount() }));
    expect(resumed.sid).toBe(first.sid);
    expect(resumed.fill).toEqual(first.fill);
    expect(resumed.answered).toBe(25);

    for (const pane of ['a', 'b']) { await page.evaluate(`nextPane('${pane}')`); await page.evaluate(`nextPane('${pane}')`); }
    await page.clock.runFor(3 * 60 * 1000);
    await page.evaluate(() => doSubmit());

    await expect.poll(() => sent.filter(result).length).toBe(1);
    const r = sent.filter(result)[0];
    expect(r.score).toMatch(/^25 \/ 25 \(100%\)/);
    if (P.to === 'sheet') {
      expect(r.sid).toBe(first.sid);
      // every log record has its own sid, so the Apps Script's repeated-sid skip can never drop the result
      expect(logs(sent).map((x) => x.sid)).not.toContain(first.sid);
      expect(new Set(logs(sent).map((x) => x.sid)).size).toBe(logs(sent).length);
    } else {
      expect(r.ex32).toContain('session ' + first.sid);
      // Make keeps one row per class + name + unit + day: no log row may use the test's own unit
      expect(logs(sent).every((x) => x.unit.startsWith(P.file + '-log ') && x.unit.endsWith(first.sid))).toBe(true);
    }
    expect(logs(sent).map(event)).toEqual(['started', 'left', 'resumed']);

    // after hand-in the device no longer offers the test
    await page.reload();
    await expect(page.locator('#resume-card')).toHaveCount(0);
  });
}
