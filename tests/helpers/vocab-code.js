// The generated vocab tests (uni-c1/c2, 10c) hold only a hash of their release code.
// A test picks its own code, swaps the page's hash for that code's hash, and types it.
const TEST_CODE = 'TESTCODE1';

async function unlock(page, code = TEST_CODE) {
  await page.evaluate(async (c) => { CODE_HASH = await codeHash(c); }, code);   // eslint-disable-line no-undef
  await page.fill('#inp-code', code);
  await page.evaluate(() => checkCode());   // async: resolves once the hash has been compared
}

module.exports = { TEST_CODE, unlock };
