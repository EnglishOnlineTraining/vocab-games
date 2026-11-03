// E2E: 9g-australia-passive-test. Online, a full sitting answered from the page's own
// keys scores 30/30 and is sent to the sheet (intercepted, never leaves the machine).
// In print mode (?print), every paper in a batch is different, a code rebuilt on its
// own gives the same paper as in the batch, and the key printed for it is that paper's.
const { test, expect } = require('@playwright/test');

const FILE = '/9g-australia-passive-test.html';

test('pools: every paper has 10 + 6 + 6 + 8 gaps, each with a key', async ({ page }) => {
  await page.goto(FILE);
  const r = await page.evaluate(() => {
    const out = [];
    for (let i = 0; i < 200; i++) {
      const P = drawPaper('check|' + i);
      out.push([P.s1.length, P.s2.length, P.s3.length, textGaps(P.text).length,
        [...P.s1, ...P.s2, ...P.s3, ...textGaps(P.text)].every((it) => it.key.length > 0)].join());
    }
    return [...new Set(out)];
  });
  expect(r).toEqual(['10,6,6,8,true']);
});

test('online: a sitting answered from the keys scores 30/30 and is sent once', async ({ page }) => {
  const sent = [];
  await page.route(/hook\.eu1\.make\.com/, (route) => {
    sent.push(JSON.parse(decodeURIComponent(route.request().postData().slice(8).replace(/\+/g, ' '))));
    route.fulfill({ status: 200, body: 'OK' });
  });
  await page.goto(FILE);
  await page.fill('#inp-name', 'Test Student');
  await page.fill('#inp-class', '9G');
  await page.evaluate(() => goLock());
  await page.fill('#inp-code', 'passive9g');   // case does not matter
  await page.evaluate(() => checkCode());
  await page.evaluate(() => startExam());
  await expect(page.locator('#pool-1 .gap-input')).toHaveCount(10);
  await expect(page.locator('#pool-4 .gap-input')).toHaveCount(8);

  // Type the first accepted answer into every gap, with a German-keyboard apostrophe.
  await page.evaluate(() => {
    const a = collect();
    const set = (id, v) => { document.getElementById(id).value = v.replace(/'/g, '´'); };
    a.s1.forEach((x) => set('s1-' + x.id, x.key[0]));
    a.s2.forEach((x) => set('s2-' + x.id, x.key[0]));
    a.s3.forEach((x) => set('s3-' + x.id, x.key[0].toUpperCase()));
    a.s4.forEach((x, i) => set('s4-' + (i + 1), '  ' + x.key[0] + ' '));
    goReview();
    doSubmit();
  });
  await expect.poll(() => sent.length).toBe(1);
  expect(sent[0].unit).toBe('9g-australia-passive-test');
  expect(sent[0].score).toBe('30 / 30');
  expect(sent[0].ex5).toContain('Passive forms 10/10');
  expect(sent[0].ex4).toMatch(/^Text: (Uluru|The Sydney Opera House|The Great Barrier Reef) \| 1\. /);
  await expect(page.locator('#s-done')).toHaveClass(/active/);
});

test('online: two students get different papers, the same student the same one', async ({ page }) => {
  await page.goto(FILE);
  const ids = await page.evaluate(() => {
    const sig = (s) => { const P = drawPaper(s); return [...P.s1, ...P.s2, ...P.s3].map((x) => x.id).join() + P.text.id; };
    return [sig('anna|9g'), sig('ben|9g'), sig('anna|9g')];
  });
  expect(ids[0]).not.toBe(ids[1]);
  expect(ids[0]).toBe(ids[2]);
});

test('print: 28 different papers, a rebuilt code matches its batch paper and key', async ({ page }) => {
  await page.goto(FILE + '?print');
  await expect(page.locator('#print-out .paper')).toHaveCount(28);
  await expect(page.locator('#print-out .key-block')).toHaveCount(28);
  const papers = await page.locator('#print-out .paper').evaluateAll((els) => els.map((e) => e.innerText.replace(/Version \S+/, '')));
  expect(new Set(papers).size).toBe(28);

  const batch7 = await page.locator('#print-out .paper').nth(6).innerHTML();
  await page.fill('#pr-code', 'a-07');
  await page.evaluate(() => printOne());
  await expect(page.locator('#print-out .paper')).toHaveCount(1);
  expect(await page.locator('#print-out .paper').innerHTML()).toBe(batch7);

  // The key for A-07 lists that paper's answers in the paper's order.
  const want = await page.evaluate(() => { const P = drawPaper(paperSeed('A-07')); return P.s1.map((x) => x.key.join(' / ')); });
  const keyText = await page.locator('#print-out .key-block').innerText();
  want.forEach((k, i) => expect(keyText).toContain(`${i + 1} ${k}`));
});

test('print: a different set letter gives a different batch', async ({ page }) => {
  await page.goto(FILE + '?print');
  const a = await page.locator('#print-out .paper').first().innerText();
  await page.fill('#pr-set', 'B');
  await page.evaluate(() => printBatch());
  await expect(page.locator('#print-out .code').first()).toHaveText('Version B-01');
  expect((await page.locator('#print-out .paper').first().innerText()).replace(/Version \S+/, '')).not.toBe(a.replace(/Version \S+/, ''));
});

// LRS (dyslexia box): spelling is not assessed, grammar still is.
test('LRS marking: a misspelt participle counts, a wrong form or auxiliary does not', async ({ page }) => {
  await page.goto(FILE);
  const r = await page.evaluate(() => {
    const m = (key, val, verb) => gapMark(key, val, verb);
    examDyslexia(true);
    const on = {
      slip: m(['has been banned'], 'has been baned', 'ban'),
      slipTwoWordVerb: m(['will be picked up'], 'will be piked up', 'pick up'),
      activeSlip: m(['stretches'], 'strechtes', 'stretch'),
      wrongAux: m(['has been banned'], 'have been banned', 'ban'),
      missingAux: m(['has been banned'], 'has banned', 'ban'),
      baseForm: m(['was discovered'], 'was discover', 'discover'),
      wrongTense: m(['climbed'], 'climbs', 'climb'),
      irregularBase: m(['had been built'], 'had been build', 'build'),
      exact: m(['is spoken'], 'is spoken', 'speak'),
      regularBase: m(['was recorded'], 'was record', 'record'),
    };
    examDyslexia(false);
    return { on, off: m(['has been banned'], 'has been baned', 'ban') };
  });
  expect(r.on).toEqual({ slip: 'spelling', slipTwoWordVerb: 'spelling', activeSlip: 'spelling', wrongAux: '', missingAux: '',
    baseForm: '', wrongTense: '', irregularBase: '', exact: 'ok', regularBase: '' });
  expect(r.off).toBe('');
});

test('LRS sitting: slips score, only the sheet is told', async ({ page }) => {
  const sent = [], mail = [];
  page.on('request', (r) => { if (r.url().startsWith('mailto:')) mail.push(decodeURIComponent(r.url())); });
  await page.route(/hook\.eu1\.make\.com/, (route) => {
    sent.push(JSON.parse(decodeURIComponent(route.request().postData().slice(8).replace(/\+/g, ' '))));
    route.fulfill({ status: 200, body: 'OK' });
  });
  await page.goto(FILE);
  await page.fill('#inp-name', 'Test Student');
  await page.fill('#inp-class', '9G');
  await page.check('#inp-dyslexia');
  const copy = await page.evaluate(() => {
    goLock(); document.getElementById('inp-code').value = RELEASE_CODE; checkCode(); startExam();
    // Every answer right, but the last word with its last two letters swapped (one slip).
    const slip = (k) => { const w = k.split(' '), x = w.pop(); return [...w, x.length < 4 ? x : x.slice(0, -2) + x.slice(-1) + x.slice(-2, -1)].join(' '); };
    const a = collect();
    ['s1', 's2', 's3'].forEach((s) => a[s].forEach((x) => { document.getElementById(s + '-' + x.id).value = slip(x.key[0]); }));
    a.s4.forEach((x, i) => { document.getElementById('s4-' + (i + 1)).value = slip(x.key[0]); });
    let out = ''; navigator.clipboard.writeText = (t) => { out = t; return Promise.resolve(); }; window.alert = () => {};
    goReview(); doSubmit(); submitByEmail(); copyAnswers();
    return out;
  });
  await expect.poll(() => sent.length).toBe(1);
  expect(Number(sent[0].score.split(' ')[0])).toBeGreaterThanOrEqual(25);   // short words (< 4 letters) can't slip
  expect(sent[0].dyslexia).toBe('yes');
  expect(sent[0].ex1).toContain('[spelling not marked]');
  expect(mail.join('') + copy).not.toMatch(/dyslexi|spelling not marked/i);
});

test('print: LRS papers get their own codes, layout and key note', async ({ page }) => {
  await page.goto(FILE + '?print');
  await page.fill('#pr-n', '4');
  await page.fill('#pr-lrs', '2');
  await page.evaluate(() => printBatch());
  await expect(page.locator('#print-out .paper')).toHaveCount(6);
  await expect(page.locator('#print-out .paper.lrs')).toHaveCount(2);
  await expect(page.locator('#print-out .paper.lrs .code').first()).toHaveText('Version A-L01');
  expect(await page.locator('#print-out .paper.lrs ol').first().evaluate((e) => getComputedStyle(e).fontFamily)).toMatch(/^Verdana/);
  await expect(page.locator('#print-out .key-block', { hasText: 'A-L02' })).toContainText('spelling is not assessed');
  await page.fill('#pr-code', 'a-l02');
  await page.evaluate(() => printOne());
  await expect(page.locator('#print-out .paper.lrs')).toHaveCount(1);
});
