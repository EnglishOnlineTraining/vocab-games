/*
 * vocab-srs.js — shared engine for the spaced-repetition vocabulary practice
 * pages (uni-c1-vocab-practice, uni-c2-vocab-practice). Each page defines
 * PAGE_UNIT, SHEET_URL and WORDS ([word, meaning] pairs) in an inline script,
 * then loads this file after exercise.js (uses its esc, normAns, g, set,
 * isTestMode). The page markup (#scr-start, #scr-round, #scr-end) is the same
 * on every page. Tested by tests/uni-vocab-practice.spec.js.
 */
(function() {
  var st = document.createElement('style');
  st.textContent = [
    '.mc-opts{display:grid;gap:.6rem;margin-top:1rem}',
    '.mc-opt{text-align:left;padding:.85rem 1rem;border:2px solid var(--border);border-radius:10px;background:var(--card);color:var(--text);font:inherit;font-size:1rem;cursor:pointer}',
    '.mc-opt:hover:not(:disabled){border-color:var(--teal)}',
    '.mc-opt.right{border-color:var(--green);color:var(--green-text);font-weight:700}',
    '.mc-opt.wrong{border-color:var(--red);color:var(--red-text);text-decoration:line-through}',
    '.def-box{font-size:1.15rem;line-height:1.5;padding:1rem 1.1rem;background:var(--info);border-radius:10px}',
    '.round-meta{display:flex;justify-content:space-between;font-size:.85rem;color:var(--muted);margin-bottom:.6rem}',
    '.meter{height:8px;background:var(--border);border-radius:4px;overflow:hidden;margin-bottom:1rem}',
    '.meter > div{height:100%;background:var(--teal);width:0;transition:width .3s}',
    '.levels{display:grid;grid-template-columns:repeat(4,1fr);gap:.5rem;text-align:center}',
    '.levels div{background:var(--inset);border:1px solid var(--border);border-radius:10px;padding:.6rem .3rem;font-size:.8rem;color:var(--muted)}',
    '.levels strong{display:block;font-size:1.4rem;color:var(--text)}',
    '.wl{width:100%;border-collapse:collapse;font-size:.92rem}',
    '.wl td{padding:.45rem .4rem;border-bottom:1px solid var(--border);vertical-align:top}',
    '.wl td:first-child{font-weight:700;white-space:nowrap}',
    '.wl td:last-child{font-size:.75rem;color:var(--muted);white-space:nowrap;text-align:right}',
    '.res-list{list-style:none;padding:0;margin:.5rem 0 0}',
    '.res-list li{padding:.35rem 0;border-bottom:1px solid var(--border)}',
    '#fb{min-height:1.6rem;margin-top:.8rem;font-weight:600}',
    '#fb.ok{color:var(--green-text)}#fb.err{color:var(--red-text)}',
    '@media (max-width:480px){.levels{grid-template-columns:repeat(2,1fr)}.wl td:first-child{white-space:normal}}'
  ].join('\n');
  document.head.appendChild(st);
})();

var STORE_KEY = 'eol_srs_' + PAGE_UNIT;
var PER_SESSION = 10;
var DAYS = [0, 1, 3, 7, 14, 30];   // days until the next review, by level 1–5
var KNOWN = 4;                     // level 4+ counts as "known"

var DEF = {};
WORDS.forEach(function(w) { DEF[w[0]] = w[1]; });

/* ── Saved progress: { name, cls, sessions, w: { word: { lvl, due } } } ──
   ponytail: localStorage only, so progress lives on one device and browser and is
   lost if the student clears site data. "Send my progress" gives the teacher a copy;
   upgrade path is a server-side store keyed by name if that is ever not enough. */
var prog = { name: '', cls: '', sessions: 0, w: {} };
try { prog = JSON.parse(localStorage.getItem(STORE_KEY)) || prog; } catch (e) {}
function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(prog)); } catch (e) {} }
function today() { var d = new Date(); return Math.floor((d - d.getTimezoneOffset() * 60000) / 864e5); }
function st(word) { return prog.w[word] || { lvl: 0, due: 0 }; }

function shuffle(a) {
  a = a.slice();
  for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
  return a;
}

/* Which 10 words: due reviews first (weakest first), then new words in list
   order, then — if a student keeps going — the words due soonest. */
function pickWords() {
  var t = today(), words = WORDS.map(function(w) { return w[0]; });
  var seen = words.filter(function(w) { return st(w).lvl > 0; });
  var due = seen.filter(function(w) { return st(w).due <= t; })
    .sort(function(a, b) { return st(a).lvl - st(b).lvl || st(a).due - st(b).due; });
  var fresh = words.filter(function(w) { return st(w).lvl === 0; });
  var later = seen.filter(function(w) { return st(w).due > t; })
    .sort(function(a, b) { return st(a).due - st(b).due; });
  return due.concat(fresh, later).slice(0, PER_SESSION);
}

function counts() {
  var c = { fresh: 0, learning: 0, familiar: 0, known: 0, due: 0 }, t = today();
  WORDS.forEach(function(w) {
    var s = st(w[0]);
    if (s.lvl === 0) c.fresh++;
    else if (s.lvl === 1) c.learning++;
    else if (s.lvl < KNOWN) c.familiar++;
    else c.known++;
    if (s.lvl > 0 && s.due <= t) c.due++;
  });
  return c;
}

function renderLevels(id) {
  var c = counts();
  document.getElementById(id).innerHTML =
    '<div><strong>' + c.fresh + '</strong>new</div>' +
    '<div><strong>' + c.learning + '</strong>learning</div>' +
    '<div><strong>' + c.familiar + '</strong>getting there</div>' +
    '<div><strong>' + c.known + '</strong>known</div>';
  return c;
}

function renderStart() {
  var c = renderLevels('levels');
  document.getElementById('due-line').textContent = prog.sessions === 0
    ? 'You have not started yet. Your first session uses the first 10 words on the list.'
    : c.due + ' word' + (c.due === 1 ? ' is' : 's are') + ' due for review today. Sessions done: ' + prog.sessions + '.';
  var label = ['new', 'learning', 'getting there', 'getting there', 'known', 'known'];
  document.getElementById('wordlist').innerHTML = WORDS.map(function(w) {
    return '<tr><td>' + esc(w[0]) + '</td><td>' + esc(w[1]) + '</td><td>' + label[st(w[0]).lvl] + '</td></tr>';
  }).join('');
}

function show(id) {
  ['scr-start', 'scr-round', 'scr-end'].forEach(function(s) { document.getElementById(s).classList.toggle('active', s === id); });
  if (id === 'scr-start') renderStart();
  window.scrollTo(0, 0);
}

/* ── A session ──
   Staggered repetition inside a round: a missed word goes back into the queue
   REQUEUE_GAP cards later, so the student meets it again after a short break,
   and the round only ends when every word has been answered correctly. */
var REQUEUE_GAP = 3;
var S = null;

function startSession() {
  var words = pickWords();
  S = { words: words, round: 1, missed: { 1: {}, 2: {} }, queue: shuffle(words), cleared: 0, answered: false };
  show('scr-round');
  showCard();
}

function showCard() {
  var word = S.queue[0], typing = S.round === 2;
  S.answered = false;
  document.getElementById('round-badge').textContent = typing ? 'Round 2 — Write' : 'Round 1 — Choose';
  document.getElementById('round-help').textContent = typing ? 'Type the word that matches the meaning.' : 'Choose the word that matches the meaning.';
  document.getElementById('round-count').textContent = S.cleared + ' / ' + S.words.length + ' right';
  document.getElementById('round-meter').style.width = (100 * S.cleared / S.words.length) + '%';
  document.getElementById('def').textContent = DEF[word];
  document.getElementById('fb').textContent = '';
  document.getElementById('fb').className = '';
  document.getElementById('next-btn').style.display = 'none';
  document.getElementById('mc').style.display = typing ? 'none' : '';
  document.getElementById('typing').style.display = typing ? '' : 'none';

  if (typing) {
    var inp = document.getElementById('typed');
    inp.value = ''; inp.disabled = false;
    document.getElementById('check-btn').disabled = false;
    inp.focus();
  } else {
    // ponytail: distractors are random words from the whole list, not chosen for similarity.
    var others = shuffle(WORDS.map(function(w) { return w[0]; }).filter(function(w) { return w !== word; })).slice(0, 3);
    document.getElementById('mc').innerHTML = shuffle(others.concat(word)).map(function(w) {
      return '<button type="button" class="mc-opt" data-w="' + esc(w) + '">' + esc(w) + '</button>';
    }).join('');
    Array.prototype.forEach.call(document.querySelectorAll('.mc-opt'), function(b) {
      b.onclick = function() { answer(b.getAttribute('data-w') === word, b); };
    });
  }
}

function answer(ok, btn, given) {
  if (S.answered) return;
  S.answered = true;
  var word = S.queue[0], fb = document.getElementById('fb');
  if (S.round === 1) {
    Array.prototype.forEach.call(document.querySelectorAll('.mc-opt'), function(b) {
      b.disabled = true;
      if (b.getAttribute('data-w') === word) b.classList.add('right');
    });
    if (!ok) btn.classList.add('wrong');
  } else {
    document.getElementById('typed').disabled = true;
    document.getElementById('check-btn').disabled = true;
  }
  S.queue.shift();
  if (ok) {
    S.cleared++;
    fb.className = 'ok';
    fb.textContent = '✓ Right: ' + word;
  } else {
    S.missed[S.round][word] = true;
    S.queue.splice(Math.min(REQUEUE_GAP, S.queue.length), 0, word);
    fb.className = 'err';
    fb.textContent = '✗ ' + (given ? 'You wrote “' + given + '”. ' : '') + 'The word is: ' + word + '. It will come back in a moment.';
  }
  document.getElementById('next-btn').style.display = '';
  document.getElementById('next-btn').focus();
}

/* Ignore case, spacing, hyphens, apostrophes and punctuation:
   "on time completion rate" and "birds eye view" count. */
function clean(s) { return normAns(s).replace(/'/g, '').replace(/[^a-z0-9]+/g, ' ').trim(); }

/* Every typed form that counts as right. "On the Beach / On the Bench" takes
   either half or both; "Corporate Social Responsibility (CSR)" takes the full
   name, the abbreviation alone, or both; "to ban" takes "ban" too. */
function accepted(word) {
  var out = [word];
  word.split(' / ').forEach(function(t) {
    var m = t.match(/^(.*?)\s*\(([^)]+)\)$/);
    if (m) out.push(m[1], m[2], t); else out.push(t);
  });
  // "to set up" also takes "set up": students often leave out the infinitive "to".
  return out.concat(out.map(function(t) { return t.replace(/^to /i, ''); })).map(clean);
}

function checkTyped() {
  var given = document.getElementById('typed').value;
  if (!given.trim() || S.answered) return;
  answer(accepted(S.queue[0]).indexOf(clean(given)) !== -1, null, given.trim());
}

function nextCard() {
  if (S.queue.length) return showCard();
  if (S.round === 1) {
    S.round = 2; S.cleared = 0; S.queue = shuffle(S.words);
    return showCard();
  }
  finishSession();
}

/* Across sessions: right first time in BOTH rounds moves a word up a level and
   pushes its next review further away; any slip sends it back to level 1, due
   again in the very next session. */
function finishSession() {
  var t = today(), slipped = [];
  S.words.forEach(function(w) {
    var s = st(w), miss = S.missed[1][w] || S.missed[2][w];
    if (miss) { slipped.push(w); prog.w[w] = { lvl: 1, due: t }; }
    else { var lvl = Math.min(s.lvl + 1, DAYS.length - 1); prog.w[w] = { lvl: lvl, due: t + DAYS[lvl] }; }
  });
  prog.sessions++;
  save();
  S.slipped = slipped;

  var r1 = S.words.length - Object.keys(S.missed[1]).length, r2 = S.words.length - Object.keys(S.missed[2]).length;
  document.getElementById('end-score').innerHTML = 'Right first time: <strong>' + r1 + ' / ' + S.words.length + '</strong> in Round 1 (choose) and <strong>' + r2 + ' / ' + S.words.length + '</strong> in Round 2 (write).';
  document.getElementById('end-words').innerHTML = S.words.map(function(w) {
    var s = prog.w[w], when = s.due === t ? 'next session' : 'in ' + (s.due - t) + ' day' + (s.due - t === 1 ? '' : 's');
    return '<li>' + (slipped.indexOf(w) === -1 ? '✓ ' : '✗ ') + '<strong>' + esc(w) + '</strong> — comes back ' + when + '</li>';
  }).join('');
  document.getElementById('focus-words').innerHTML = slipped.length
    ? 'You missed these at least once. They come back in your next session: <strong>' + slipped.map(esc).join(', ') + '</strong>'
    : 'Nothing to focus on — you got every word right first time in both rounds.';
  renderLevels('levels-end');
  set('inp-name', prog.name); set('inp-class', prog.cls);
  document.getElementById('send-btn').disabled = false;
  document.getElementById('send-btn').textContent = 'Send my progress';
  document.getElementById('send-fb').textContent = '';
  show('scr-end');
}

function sendProgress() {
  var fb = document.getElementById('send-fb'), btn = document.getElementById('send-btn');
  prog.name = g('inp-name'); prog.cls = g('inp-class'); save();
  if (!prog.name) { fb.className = 'feedback err'; fb.textContent = 'Please enter your name first.'; return; }
  var c = counts();
  var payload = {
    name: prog.name, cls: prog.cls, unit: PAGE_UNIT,
    session: prog.sessions,
    practised: S.words.join(', '),
    round1: (S.words.length - Object.keys(S.missed[1]).length) + ' / ' + S.words.length,
    round2: (S.words.length - Object.keys(S.missed[2]).length) + ' / ' + S.words.length,
    focus: S.slipped.join(', ') || 'none',
    known: c.known + ' / ' + WORDS.length,
    notStarted: c.fresh
  };
  btn.disabled = true; btn.textContent = 'Sending...';
  function done() { btn.textContent = 'Sent ✓'; fb.className = 'feedback ok'; fb.textContent = 'Your teacher has your progress for this session.'; }
  if (isTestMode()) { console.log('TEST MODE - payload:', payload); return done(); }
  fetch(SHEET_URL, {
    method: 'POST', mode: 'no-cors',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'payload=' + encodeURIComponent(JSON.stringify(payload))
  }).then(done).catch(function() {
    btn.disabled = false; btn.textContent = 'Send my progress';
    fb.className = 'feedback err'; fb.textContent = 'That did not send. Check your connection and try again.';
  });
}

/* The whole list as a Word document (.docx), for revising on paper or offline.
   A .docx is a zip of three XML files; zipStore() writes it uncompressed, so no
   library is needed. Opens in Word, Pages, LibreOffice, Google Docs and phone
   previews. */
function xmlEsc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

var DOCX_FONT = '<w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/>';

function docxCell(text, bold) {
  return '<w:tc><w:p><w:r><w:rPr>' + DOCX_FONT + (bold ? '<w:b/>' : '') + '<w:sz w:val="20"/></w:rPr>'
    + '<w:t xml:space="preserve">' + xmlEsc(text) + '</w:t></w:r></w:p></w:tc>';
}

function downloadWordList() {
  var W = 'http://schemas.openxmlformats.org/';
  var title = document.querySelector('.welcome-title').textContent + ': word list';
  var border = ['top', 'left', 'bottom', 'right', 'insideH', 'insideV'].map(function(b) {
    return '<w:' + b + ' w:val="single" w:sz="4" w:space="0" w:color="999999"/>';
  }).join('');
  var rows = '<w:tr>' + docxCell('Word', true) + docxCell('Meaning', true) + '</w:tr>'
    + WORDS.map(function(w) { return '<w:tr>' + docxCell(w[0], true) + docxCell(w[1], false) + '</w:tr>'; }).join('');
  var files = {
    '[Content_Types].xml': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="' + W + 'package/2006/content-types">'
      + '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
      + '<Default Extension="xml" ContentType="application/xml"/>'
      + '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
    '_rels/.rels': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="' + W + 'package/2006/relationships">'
      + '<Relationship Id="rId1" Type="' + W + 'officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
    'word/document.xml': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="' + W + 'wordprocessingml/2006/main"><w:body>'
      + '<w:p><w:r><w:rPr>' + DOCX_FONT + '<w:b/><w:sz w:val="32"/></w:rPr><w:t>' + xmlEsc(title) + '</w:t></w:r></w:p>'
      + '<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:tblBorders>' + border + '</w:tblBorders>'
      + '<w:tblCellMar><w:top w:w="60" w:type="dxa"/><w:left w:w="100" w:type="dxa"/><w:bottom w:w="60" w:type="dxa"/><w:right w:w="100" w:type="dxa"/></w:tblCellMar></w:tblPr>'
      + '<w:tblGrid><w:gridCol w:w="3000"/><w:gridCol w:w="6000"/></w:tblGrid>' + rows + '</w:tbl>'
      + '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="0" w:footer="0" w:gutter="0"/></w:sectPr>'
      + '</w:body></w:document>'
  };
  var a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([zipStore(files)], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }));
  a.download = PAGE_UNIT.replace(/^uni-/, '').replace(/-practice$/, '') + '-word-list.docx';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(function() { URL.revokeObjectURL(a.href); }, 1000);
}

/* Minimal zip writer: stored (method 0) entries, CRC-32, one central directory.
   ponytail: no compression, so the file is ~3x bigger than Word's own (about
   30 KB here). Fine for a word list; use a zip library if it ever holds images. */
function zipStore(files) {
  var enc = new TextEncoder(), parts = [], central = [], offset = 0, n = 0;
  var crcTable = [];
  for (var i = 0; i < 256; i++) { var c = i; for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; crcTable[i] = c >>> 0; }
  function crc32(b) { var c = 0xFFFFFFFF; for (var i = 0; i < b.length; i++) c = crcTable[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
  function header(sig, fields) {   // fields: [value, bytes] pairs, little-endian
    var len = 4 + fields.reduce(function(t, f) { return t + f[1]; }, 0), v = new DataView(new ArrayBuffer(len)), p = 4;
    v.setUint32(0, sig, true);
    fields.forEach(function(f) { if (f[1] === 2) v.setUint16(p, f[0], true); else v.setUint32(p, f[0], true); p += f[1]; });
    return new Uint8Array(v.buffer);
  }
  Object.keys(files).forEach(function(name) {
    var nm = enc.encode(name), data = enc.encode(files[name]), crc = crc32(data);
    var common = [[20, 2], [0x0800, 2], [0, 2], [0, 2], [33, 2], [crc, 4], [data.length, 4], [data.length, 4], [nm.length, 2], [0, 2]];
    var local = header(0x04034b50, common);
    parts.push(local, nm, data);
    central.push(header(0x02014b50, [[20, 2]].concat(common, [[0, 2], [0, 2], [0, 2], [0, 4], [offset, 4]])), nm);
    offset += local.length + nm.length + data.length;
    n++;
  });
  var cdSize = central.reduce(function(t, b) { return t + b.length; }, 0);
  return new Blob(parts.concat(central, [header(0x06054b50, [[0, 2], [0, 2], [n, 2], [n, 2], [cdSize, 4], [offset, 4], [0, 2]])]));
}

function resetProgress() {
  if (!confirm('Delete all your saved progress for this word list?')) return;
  prog = { name: prog.name, cls: prog.cls, sessions: 0, w: {} };
  save();
  renderStart();
}

document.addEventListener('DOMContentLoaded', renderStart);
