#!/usr/bin/env node
/* teacher-codes.js — the release codes on teacher-tests.html are stored encrypted.

   The page is public (noindex only) and so is this repo, so a code cell holds
   <code data-enc="…"> (AES-GCM, key = PBKDF2-SHA256 of the teacher password with the page's
   salt, 600000 rounds), and the page decrypts them in the browser once the password is typed.
   Test links stay plain: build-head.js reads them to find the unlisted tests.

   Password: env TEACHER_PASS, else the first line of ~/.eol-teacher-pass (outside the repo).

     node scripts/teacher-codes.js set <unit> <code>   put a code in the row linking <unit>.html
     node scripts/teacher-codes.js init                 encrypt every plain <td><code>X</code></td>
                                                        cell (a new salt, so all cells at once)
   ponytail: one shared password for every code; anyone who has it reads them all. */
const fs = require('fs'), path = require('path'), os = require('os'), crypto = require('crypto');

const PAGE = path.join(__dirname, '..', 'teacher-tests.html');
const ROUNDS = 600000;   // must match ROUNDS in teacher-tests.html

function password() {
  if (process.env.TEACHER_PASS) return process.env.TEACHER_PASS;
  const f = path.join(os.homedir(), '.eol-teacher-pass');
  if (fs.existsSync(f)) return fs.readFileSync(f, 'utf8').split('\n')[0].trim();
  throw new Error('no teacher password: set TEACHER_PASS or write it to ~/.eol-teacher-pass');
}
const keyFor = (pass, salt) => crypto.pbkdf2Sync(pass, Buffer.from(salt, 'base64'), ROUNDS, 32, 'sha256');
// iv | ciphertext | tag, base64: WebCrypto's AES-GCM decrypt takes ciphertext+tag together.
function encrypt(key, text) {
  const iv = crypto.randomBytes(12), c = crypto.createCipheriv('aes-256-gcm', key, iv);
  return Buffer.concat([iv, c.update(text, 'utf8'), c.final(), c.getAuthTag()]).toString('base64');
}
function decrypt(key, b64) {
  const b = Buffer.from(b64, 'base64'), d = crypto.createDecipheriv('aes-256-gcm', key, b.subarray(0, 12));
  d.setAuthTag(b.subarray(-16));
  return Buffer.concat([d.update(b.subarray(12, -16)), d.final()]).toString('utf8');
}
const cell = (key, code) => `<td><code data-enc="${encrypt(key, code)}">locked</code></td>`;
const saltOf = (html) => (html.match(/<meta name="code-salt" content="([^"]+)">/) || [])[1];

// Put `code` in the last cell of the row that links to `unit`.html. Checks the password first:
// a cell another password could not open would lock Shaun out of that one code.
function setCode(unit, code) {
  const html = fs.readFileSync(PAGE, 'utf8'), salt = saltOf(html);
  if (!salt) throw new Error('teacher-tests.html has no code-salt: run `teacher-codes.js init` first');
  const key = keyFor(password(), salt);
  const old = html.match(/data-enc="([^"]+)"/);
  if (old) try { decrypt(key, old[1]); } catch (e) { throw new Error('wrong teacher password'); }
  const row = new RegExp('(<tr>\\s*<td><a href="' + unit + '\\.html">[\\s\\S]*?)<td>[^\\n]*</td>(\\s*</tr>)');
  if (!row.test(html)) throw new Error('no row for ' + unit + ' in teacher-tests.html');
  fs.writeFileSync(PAGE, html.replace(row, (_, a, b) => a + cell(key, code) + b));
}

function init() {
  let html = fs.readFileSync(PAGE, 'utf8');
  if (saltOf(html)) throw new Error('already encrypted (code-salt is set)');
  const salt = crypto.randomBytes(16).toString('base64'), key = keyFor(password(), salt);
  let n = 0;
  html = html.replace(/<td><code>([^<]+)<\/code><\/td>/g, (_, code) => (n++, cell(key, code)))
    .replace('<meta name="robots"', `<meta name="code-salt" content="${salt}">\n<meta name="robots"`);
  fs.writeFileSync(PAGE, html);
  console.log(`✓ encrypted ${n} codes`);
}

module.exports = { setCode, encrypt, decrypt, keyFor, saltOf };

if (require.main === module) {
  const [cmd, unit, code] = process.argv.slice(2);
  try {
    if (cmd === 'init') init();
    else if (cmd === 'set' && unit && code) { setCode(unit, code); console.log('✓ ' + unit); }
    else { console.error('usage: teacher-codes.js init | set <unit> <code>'); process.exit(1); }
  } catch (e) { console.error('✗ ' + e.message); process.exit(1); }
}
