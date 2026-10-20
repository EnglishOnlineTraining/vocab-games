/*
 * integrity.js — integrity counters shared by every page that sends free text
 * (docs/integrity-signals-spec.md). Loaded before exercise.js on framework pages,
 * and on its own by the standalone class tests and uni-writing-task.
 *
 * Counts how free text was produced so the teacher can follow up in class.
 * Counts only: no content, no per-key timestamps, no device data. Never changes
 * a score or grade. A page reads the counts with eolIntFields() and adds them to
 * its own payload; who receives them is the page's (or exercise.js's) decision.
 *   eolIntStart()        when the work starts
 *   eolIntSnapshot()     to save with a draft; eolIntRestore(saved) on resume
 *   eolIntFields()       the int_* fields for a payload
 *   var INTEGRITY_LEVEL  'strict' | 'standard' | 'off' (default: by UNIT prefix)
 */
var eolInt = { elapsedMs: 0, sessionStart: 0, typingMs: 0, lastInput: 0, keys: 0, deletes: 0,
               pasteTries: 0, dropTries: 0, bulkInserts: 0, resumes: 0, partial: 0 };

function eolIntLevel() {
  if (typeof INTEGRITY_LEVEL !== 'undefined') return INTEGRITY_LEVEL;
  var unit = (typeof UNIT !== 'undefined') ? String(UNIT) : '';
  return /^(8c|9g|9c|10g|10c|msa-c|uni)-/.test(unit) ? 'standard' : 'off';
}

function eolIntStart() {
  if (!eolInt.sessionStart) eolInt.sessionStart = Date.now();
}

/* Saved inside the autosave draft, so a reload or resume keeps the counts. */
function eolIntSnapshot() {
  var s = {};
  for (var k in eolInt) s[k] = eolInt[k];
  s.elapsedMs = eolInt.elapsedMs + (eolInt.sessionStart ? Date.now() - eolInt.sessionStart : 0);
  s.sessionStart = 0;
  s.lastInput = 0;
  return s;
}

function eolIntRestore(saved) {
  if (saved && typeof saved === 'object') {
    for (var k in eolInt) if (typeof saved[k] === 'number') eolInt[k] = saved[k];
  } else {
    eolInt.partial = 1;   // draft from before counting began: restored text has no counts
  }
  eolInt.sessionStart = 0;
  eolInt.lastInput = 0;
  eolInt.resumes++;
}

function eolIntWords() {
  var n = 0;
  var tas = document.querySelectorAll('textarea');
  for (var i = 0; i < tas.length; i++) {
    if (tas[i].readOnly) continue;   // the hidden copy-block summary, not the student's typing
    var w = tas[i].value.trim();
    if (w) n += w.split(/\s+/).length;
  }
  return n;
}

function eolIntFields() {
  var s = eolIntSnapshot();
  var words = eolIntWords();
  var typingSec = Math.round(s.typingMs / 1000);
  return {
    int_level: eolIntLevel(),
    int_time_total: Math.round(s.elapsedMs / 1000),
    int_time_typing: typingSec,
    int_keys: s.keys,
    int_deletes: s.deletes,
    int_paste_tries: s.pasteTries,
    int_drop_tries: s.dropTries,
    int_bulk_inserts: s.bulkInserts,
    int_words: words,
    int_wpm: typingSec ? Math.round(words / (typingSec / 60)) : 0,
    int_resumes: s.resumes,
    int_partial: s.partial
  };
}

/* Count input events, not keydown: Android reports key 229 for every key, and
   IME/autocorrect change text without a matching key. Gaps over 30 s are idle. */
document.addEventListener('input', function(e) {
  if (!e.target || e.target.tagName !== 'TEXTAREA') return;
  var type = e.inputType || 'insertText';
  // More than a word in one event: an extension, autotyper or tool inserting text.
  if (type.indexOf('insert') === 0 && e.data && e.data.length > 20) eolInt.bulkInserts++;
  if (type.indexOf('delete') === 0) eolInt.deletes++;
  else if (type === 'insertText' || type === 'insertCompositionText'
        || type === 'insertLineBreak' || type === 'insertParagraph') eolInt.keys++;
  else return;   // spellcheck replacement etc.: neither typed nor deleted
  var now = Date.now();
  if (eolInt.lastInput && now - eolInt.lastInput <= 30000) eolInt.typingMs += now - eolInt.lastInput;
  eolInt.lastInput = now;
});

/* Text dragged from a side panel would bypass the paste block. */
document.addEventListener('drop', function(e) {
  var t = e.target;
  if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) {
    e.preventDefault();
    eolInt.dropTries++;
    eolIntToast('✏️ Dropping text is not allowed');
  }
});

/* Paste is blocked by each page's own handler; this only counts the attempt. */
document.addEventListener('paste', function(e) {
  var t = e.target;
  if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) eolInt.pasteTries++;
}, true);

function eolIntToast(text) {
  var msg = document.createElement('div');
  msg.textContent = text;
  msg.style.cssText = 'position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);background:#1a3a5c;color:#fff;padding:.55rem 1.2rem;border-radius:8px;font-size:.85rem;font-family:inherit;z-index:9999;pointer-events:none;opacity:1;transition:opacity .4s';
  document.body.appendChild(msg);
  setTimeout(function() {
    msg.style.opacity = '0';
    setTimeout(function() { msg.remove(); }, 400);
  }, 2000);
}
