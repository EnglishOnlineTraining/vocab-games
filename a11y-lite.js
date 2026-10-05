/*
 * a11y-lite.js — the accessible half of answer feedback, for pages that do not
 * load exercise.js (the Abitur packs, themen/ topic pages, the IELTS glossary,
 * vocab games, klasse7-mini). build-head.js adds it to exactly those pages
 * whose scripts mark answers with a colour class.
 *
 * exercise.js already does this on framework pages (eolMarkGap, live regions).
 * These pages only turned a control green or red, so a student who cannot see
 * the colour, or uses a screen reader, got no result at all (WCAG 1.4.1, 4.1.2,
 * 4.1.3). This file watches for those classes and adds:
 *   - a ✓ / ✗ mark with "correct"/"incorrect" for screen readers: a small
 *     span after a form control (plus aria-invalid), a CSS ::after on buttons
 *     and options;
 *   - role="status" on feedback boxes, so a score is announced when it appears;
 *   - an aria-label on any <select> that has no name, from the text of its row.
 * It changes no scoring and no page logic: it only reads the classes the page
 * already sets.
 */
(function () {
  'use strict';
  var OK = /(^|\s)(correct|right|pw-right)(\s|$)/;
  var BAD = /(^|\s)(wrong|pw-wrong)(\s|$)/;
  // Only things a student answers with: never a heading or a panel that happens
  // to share a class name.
  var TARGET = 'select, input, textarea, button, .mc-opt, [role="option"], [role="radio"]';

  function style() {
    if (document.getElementById('a11y-lite-style')) return;
    var s = document.createElement('style');
    s.id = 'a11y-lite-style';
    s.textContent = '.a11y-mark{font-weight:700;margin-left:.3em}.a11y-mark.ok{color:#1a7f37}'
      + '.a11y-mark.bad{color:#c62828}'
      // The "/ text" part is the alternative text a screen reader announces; the
      // plain declaration before it is the fallback for browsers without it.
      + '.a11y-ok::after{content:" ✓";content:" ✓" / " correct";font-weight:700;color:#1a7f37}'
      + '.a11y-bad::after{content:" ✗";content:" ✗" / " incorrect";font-weight:700;color:#c62828}'
      + '.a11y-sr{position:absolute;width:1px;height:1px;'
      + 'overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}';
    document.head.appendChild(s);
  }

  function isControl(el) {
    return /^(SELECT|INPUT|TEXTAREA)$/.test(el.tagName);
  }

  function update(el) {
    if (!el.matches || !el.matches(TARGET)) return;
    var cls = typeof el.className === 'string' ? el.className : '';
    var state = OK.test(cls) ? 'ok' : BAD.test(cls) ? 'bad' : '';
    if (!isControl(el)) {
      // Buttons and options: a CSS ::after mark, never a DOM node. Pages compare
      // an option's textContent with the answer (vocab-games), so adding text
      // inside it would change what they read.
      el.classList.toggle('a11y-ok', state === 'ok');
      el.classList.toggle('a11y-bad', state === 'bad');
      return;
    }
    // A form control cannot hold a child, so its mark sits right after it.
    var mark = el.nextElementSibling && el.nextElementSibling.classList.contains('a11y-mark') ? el.nextElementSibling : null;
    if (!state) {
      if (mark) mark.remove();
      el.removeAttribute('aria-invalid');
      return;
    }
    if (!mark) {
      mark = document.createElement('span');
      el.parentNode.insertBefore(mark, el.nextSibling);
    }
    mark.className = 'a11y-mark ' + state;
    mark.innerHTML = '<span aria-hidden="true">' + (state === 'ok' ? '✓' : '✗') + '</span>'
      + '<span class="a11y-sr">' + (state === 'ok' ? ' correct' : ' incorrect') + '</span>';
    el.setAttribute('aria-invalid', state === 'bad' ? 'true' : 'false');
  }

  function nameSelects(root) {
    (root.querySelectorAll ? root.querySelectorAll('select') : []).forEach(function (sel) {
      if (sel.getAttribute('aria-label') || sel.getAttribute('aria-labelledby') || (sel.labels && sel.labels.length)) return;
      var row = sel.closest('.match-row, .pw-item, li, p, tr, label') || sel.parentNode;
      var clone = row.cloneNode(true);
      clone.querySelectorAll('select, option, script, .a11y-mark').forEach(function (n) { n.remove(); });
      var text = (clone.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120);
      if (text) sel.setAttribute('aria-label', text);
    });
  }

  function liveRegions(root) {
    (root.querySelectorAll ? root.querySelectorAll('.feedback, .pw-score, [id^="fb"]') : []).forEach(function (el) {
      if (!el.getAttribute('role') && !el.getAttribute('aria-live')) el.setAttribute('role', 'status');
    });
  }

  function init() {
    style();
    nameSelects(document);
    liveRegions(document);
    document.querySelectorAll(TARGET).forEach(update);
    if (!window.MutationObserver) return;
    new MutationObserver(function (records) {
      records.forEach(function (r) {
        if (r.type === 'attributes') { update(r.target); return; }
        r.addedNodes.forEach(function (n) {
          if (n.nodeType !== 1 || n.classList.contains('a11y-mark')) return;
          nameSelects(n);
          liveRegions(n);
          if (n.matches(TARGET)) update(n);
          n.querySelectorAll(TARGET).forEach(update);
        });
      });
    }).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
