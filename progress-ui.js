/*
 * progress-ui.js — shows the progress exercise.js saves (eol_progress,
 * eol_draft_<unit>) where students choose what to do next. Loaded by
 * index.html, the category hubs and activities.html; none of them load
 * exercise.js. Everything is per device (localStorage); nothing is sent.
 *
 *   - ✓ on every exercise card whose unit is completed
 *   - "3/12 done" on the homepage class cards
 *   - a "Continue where you left off" card on the homepage for the most
 *     recently saved unfinished exercise
 *
 * Silent when storage is blocked or empty: the pages look as they did.
 */
(function () {
  'use strict';

  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (e) { return fallback; }
  }
  function unitOf(href) { return (href || '').split(/[?#]/)[0].replace(/^.*\//, '').replace(/\.html$/, ''); }

  var progress = read('eol_progress', {});
  var done = {};
  Object.keys(progress).forEach(function (u) { if (progress[u] && progress[u].completed) done[u] = true; });

  // ✓ on exercise cards (category hubs, activities.html)
  document.querySelectorAll('a.exercise-card, a.activity-card, .hub-card > a').forEach(function (a) {
    if (!done[unitOf(a.getAttribute('href'))]) return;
    var b = document.createElement('span');
    b.textContent = '✓';
    b.setAttribute('role', 'img');
    b.setAttribute('aria-label', 'completed');
    b.style.cssText = 'position:absolute;top:.6rem;right:.6rem;width:1.5rem;height:1.5rem;border-radius:50%;'
      + 'background:var(--green,#1d7a42);color:#fff;font-size:.8rem;font-weight:800;'
      + 'display:inline-flex;align-items:center;justify-content:center';
    a.style.position = 'relative';
    a.appendChild(b);
  });

  // The latest unfinished exercise. A draft is cleared when the exercise is
  // finished; one older than its own completion is a leftover from before
  // that rule and is skipped.
  var draft = null;
  try {
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k.indexOf('eol_draft_') !== 0) continue;
      var d = read(k, null), unit = k.slice(10), p = progress[unit];
      if (!d || !d.ts) continue;
      if (p && p.completed && Date.parse(p.date) >= d.ts) continue;
      if (!draft || d.ts > draft.ts) draft = { unit: unit, ts: d.ts, step: d.curStep || 0, total: d.total };
    }
  } catch (e) { /* storage blocked */ }

  var classCards = document.querySelectorAll('a.school-link[href]');
  var years = document.getElementById('years');
  var wantCounts = classCards.length && Object.keys(done).length;
  if (!wantCounts && !(draft && years)) return;

  fetch('data/exercises.json').then(function (r) { return r.json(); }).then(function (exercises) {
    // "3/12 done" on the homepage class cards (8c-activities.html → year 8, oberschule)
    classCards.forEach(function (a) {
      var m = a.getAttribute('href').match(/^(\d+)([cg])-activities\.html$/);
      if (!m) return;
      var type = m[2] === 'c' ? 'oberschule' : 'gymnasium';
      var mine = exercises.filter(function (e) { return String(e.year) === m[1] && e.schoolType === type; });
      var n = mine.filter(function (e) { return done[unitOf(e.file)]; }).length;
      if (!n) return;
      var s = document.createElement('span');
      s.className = 'school-progress';
      s.textContent = '✓ ' + n + '/' + mine.length + ' done';
      s.style.cssText = 'font-size:.75rem;font-weight:700;color:var(--green-text,#1d7a42)';
      a.appendChild(s);
    });

    // "Continue where you left off" above the class list
    if (!draft || !years) return;
    var ex = exercises.filter(function (e) { return unitOf(e.file) === draft.unit; })[0];
    if (!ex) return;
    var where = draft.total && draft.step >= draft.total ? 'ready to submit'
      : draft.step >= 1 ? 'Exercise ' + String.fromCharCode(64 + draft.step) : '';
    var c = document.createElement('a');
    c.id = 'eol-continue';
    c.href = ex.file;
    c.style.cssText = 'display:block;max-width:860px;margin:0 auto 1.5rem;padding:1rem 1.2rem;border-radius:14px;'
      + 'background:#f5e6b0;border:2px solid #c9a227;color:#1a1a1a;text-decoration:none;'
      + 'font-family:inherit;box-shadow:0 2px 16px rgba(26,58,92,.1)';
    c.innerHTML = '<span style="display:block;font-size:.8rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em">'
      + 'Continue where you left off</span>'
      + '<span style="display:block;font-size:1.05rem;font-weight:700;margin-top:.2rem"></span>';
    c.lastChild.textContent = ex.title + (where ? ' — ' + where : '') + ' →';
    years.parentNode.insertBefore(c, years);
  }).catch(function () { /* offline or blocked: no counts, no card */ });
})();
