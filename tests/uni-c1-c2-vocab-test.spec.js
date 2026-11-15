// E2E: uni-c1-vocab-test and uni-c2-vocab-test. Each paper has 15 + 10 + 5 different
// words and never prints a Section B answer in a meaning on screen. A sitting answered
// correctly (B typed in other accepted forms: abbreviation, the other half of "A / B",
// the listed twin) scores 25/25 and is sent once to the university sheet
// (intercepted, never leaves the machine).
const { test, expect } = require('@playwright/test');

for (const level of ['c1', 'c2']) {
  const FILE = `/uni-${level}-vocab-test.html`;

  test(`${level}: every paper is 15 + 10 + 5 different words, no B answer on screen`, async ({ page }) => {
    await page.goto(FILE);
    const bad = await page.evaluate(() => {
      const out = [];
      for (let i = 0; i < 300; i++) {
        const p = pickPaper();
        const all = [...p.match, ...p.fill, ...p.use].map((x) => x.t);
        if (p.match.length !== 15 || p.fill.length !== 10 || p.use.length !== 5) out.push('size ' + [p.match.length, p.fill.length, p.use.length]);
        if (new Set(all).size !== 30) out.push('duplicate');
        const shown = [...p.match, ...p.fill];
        p.fill.forEach((b) => shown.forEach((x) => { if (x !== b && termIn(b, x.d)) out.push(b.t + ' in: ' + x.d); }));
        [...p.fill, ...p.use].forEach((x) => { if (UI_WORDS.includes(x.t)) out.push('UI word asked: ' + x.t); });
      }
      return [...new Set(out)];
    });
    expect(bad).toEqual([]);
  });

  test(`${level}: a correct sitting scores 25/25 and is sent once`, async ({ page }) => {
    const sent = [];
    await page.route((url) => url.hostname === 'script.google.com', (route) => {
      sent.push(JSON.parse(route.request().postData()));
      route.fulfill({ status: 200, body: 'OK' });
    });
    await page.clock.install({ time: new Date('2026-11-13T09:00:00Z') });
    await page.goto(FILE);
    await page.fill('#inp-name', 'Test Student');
    await page.fill('#inp-group', 'T1');
    await page.evaluate(() => goRules());
    await page.fill('#inp-code', 'wrong');
    await page.evaluate(() => checkCode());
    await expect(page.locator('#lock-err')).toHaveClass(/show/);
    await page.fill('#inp-code', (await page.evaluate(() => RELEASE_CODE)).toLowerCase());   // case does not matter
    await page.evaluate(() => checkCode());
    await expect(page.locator('#s-rules')).toHaveClass(/active/);
    await page.evaluate(() => startExam());
    // Section C gives the word only, never its meaning.
    expect(await page.evaluate(() => useItems.filter((x) =>
      document.getElementById('use-list').textContent.includes(x.d)).length)).toBe(0);

    await page.evaluate(() => {
      const fire = (el) => el.dispatchEvent(new Event('input', { bubbles: true }));
      document.querySelectorAll('.qa-select').forEach((s, i) => { s.value = matchItems[i].t; fire(s); });
      // Type the LAST accepted form (abbreviation, second half, twin), upper case, curly apostrophe.
      document.querySelectorAll('.qa-input').forEach((inp, i) => {
        const f = typedForms(fillItems[i]);
        inp.value = ' ' + f[f.length - 1].toUpperCase().replace(/'/g, '’') + ' '; fire(inp);
      });
      document.querySelectorAll('#use-list textarea').forEach((t, i) => {
        t.value = 'We talked about ' + forms(useItems[i].t)[0] + ' in detail during the meeting today.'; fire(t);
      });
    });
    for (const pane of ['a', 'b']) { await page.evaluate(`nextPane('${pane}')`); await page.evaluate(`nextPane('${pane}')`); }
    await expect(page.locator('#sub-btn')).toBeDisabled();   // the 2-minute gate
    await page.clock.runFor(2 * 60 * 1000 + 1000);
    await expect(page.locator('#sub-btn')).toBeEnabled();
    await page.evaluate(() => doSubmit());

    const results = () => sent.filter((x) => x.unit === `uni-${level}-vocab-test`);
    await expect.poll(() => results().length).toBe(1);
    const p = results()[0];
    // the start went to its own log tab, with its own sid (the Apps Script skips a repeated sid)
    const logs = sent.filter((x) => x.unit === `uni-${level}-vocab-test-log`);
    expect(logs.map((x) => x.event)).toEqual(['started']);
    expect(logs[0].sid).not.toBe(p.sid);
    expect(p.unit).toBe(`uni-${level}-vocab-test`);
    expect(p.cls).toBe('T1');
    expect(p.score).toMatch(/^25 \/ 25 \(100%\)/);
    expect(Object.keys(p).filter((k) => /^[ABC]\d\d$/.test(k))).toHaveLength(30);
    expect(p.section_c).toContain('5 / 5');
    expect(p.integrity).toContain('session ');
    await expect(page.locator('#done-message')).toHaveText('Your result has been sent to your teacher.');
  });
}

test('alternative forms: abbreviation, either half, the twin, not a stranger', async ({ page }) => {
  await page.goto('/uni-c2-vocab-test.html');
  const r = await page.evaluate(() => {
    const by = (t) => VOCAB_BANK.find((x) => x.t === t);
    const ok = (t, g) => typedForms(by(t)).includes(vnorm(g));
    return [
      ok('Corporate Social Responsibility (CSR)', 'csr'),
      ok('Corporate Social Responsibility (CSR)', 'corporate social responsibility'),
      ok('On the Beach / On the Bench', 'on the bench'),
      ok('Bird’s Eye View', "bird's-eye view"),
      ok('Capacity', 'bandwidth'),
      ok('Capacity', 'deck'),
      checkUse(by('Tighten Up / Clean Up'), 'Could you clean up the slides before the client meeting tomorrow?').ok,
    ];
  });
  expect(r).toEqual([true, true, true, true, true, false, true]);
});

for (const level of ['c1', 'c2']) {
  test(`${level}: the same student gets the same paper; another student a different one`, async ({ page }) => {
    await page.goto(`/uni-${level}-vocab-test.html`);
    const r = await page.evaluate(() => {
      const paper = (n, g) => { sName = n; sGroup = g; buildQuestions(); return JSON.stringify([matchItems, fillItems, useItems, matchOptions].map((a) => a.map((x) => x.t || x))); };
      return [paper('Maria Schmidt', 'C1 English'), paper('  maria   SCHMIDT ', 'c1 english'), paper('Jonas Weber', 'C1 English')];
    });
    expect(r[1]).toBe(r[0]);
    expect(r[2]).not.toBe(r[0]);
  });

  test(`${level}: restarting on the device logs the abandoned attempt; leaving logs a beacon`, async ({ page }) => {
    const sent = [];
    await page.route((url) => url.hostname === 'script.google.com', (route) => {
      sent.push(JSON.parse(route.request().postData()));
      route.fulfill({ status: 200, body: 'OK' });
    });
    await page.goto(`/uni-${level}-vocab-test.html`);
    const start = async () => {
      await page.fill('#inp-name', 'Test Student');
      await page.fill('#inp-group', 'T1');
      await page.evaluate(() => goRules());
      await page.fill('#inp-code', await page.evaluate(() => RELEASE_CODE));
      await page.evaluate(() => checkCode());
      await page.evaluate(() => startExam());
    };
    await start();
    await page.evaluate(() => { const s = document.querySelector('.qa-select'); s.value = matchItems[0].t; s.dispatchEvent(new Event('change')); });
    await page.evaluate(() => window.dispatchEvent(new Event('pagehide')));
    await page.reload();
    await start();   // "Not me — start a new test", or just registering again
    const ev = () => sent.filter((x) => /-log$/.test(x.unit)).map((x) => x.event);
    await expect.poll(ev).toEqual(['started', 'left', 'abandoned', 'started']);
    const ab = sent.find((x) => x.event === 'abandoned');
    expect(ab.detail).toMatch(/answered A\+B 1 \/ 25, C 0 \/ 5 \| A1 /);
    expect(sent.filter((x) => x.unit === `uni-${level}-vocab-test`)).toHaveLength(0);   // no result was sent
  });
}
