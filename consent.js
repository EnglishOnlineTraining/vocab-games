/* ──────────────────────────────────────────────────────────────────────────
 * consent.js — cookie/tracking consent for activities.englishonline.training
 *
 * Why this exists: every page loads Google Tag Manager. Under GDPR Art. 6 and
 * TTDSG § 25 that may only happen after the visitor agrees, so the GTM loader
 * in build-head.js is gated on the choice this file records. Nothing is sent
 * to Google until someone presses "Einverstanden".
 *
 * The head block (build-head.js → CONSENT_HEAD) has already run by the time
 * this file loads. It has:
 *   • declared Consent Mode v2 defaults, everything non-essential denied;
 *   • read the stored choice and, if it was "granted", injected GTM.
 * This file only draws the banner, records a new choice, and — when the answer
 * is yes — injects GTM there and then so the visitor need not reload.
 *
 * Storage: localStorage key "eol-consent", value "granted" | "denied", plus
 * "eol-consent-at" (ISO date) so a stale choice can be re-asked later. Wrapped
 * in try/catch: a private window or blocked site data must not break the page.
 *
 * The progress data the site keeps in localStorage (eolSaveProgress) is NOT
 * covered here. It is what the student asked the page to do, stays on their
 * device, and reaches nobody — strictly necessary, so no consent gate.
 * ────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var KEY = 'eol-consent';
  var KEY_AT = 'eol-consent-at';
  var GTM_ID = 'GTM-5HXNNPCS';

  function read() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function write(v) {
    try {
      localStorage.setItem(KEY, v);
      localStorage.setItem(KEY_AT, new Date().toISOString());
    } catch (e) { /* private window: the choice holds for this page view only */ }
  }

  function gtag() { (window.dataLayer = window.dataLayer || []).push(arguments); }

  // Idempotent: the head block sets this flag when it has already injected GTM.
  function loadGtm() {
    if (window.eolGtmLoaded) return;
    window.eolGtmLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtm.js?id=' + GTM_ID;
    (document.head || document.documentElement).appendChild(s);
    (window.dataLayer = window.dataLayer || []).push({
      'gtm.start': new Date().getTime(), event: 'gtm.js'
    });
  }

  function grant() {
    gtag('consent', 'update', {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      analytics_storage: 'granted'
    });
    loadGtm();
  }

  function deny() {
    gtag('consent', 'update', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied'
    });
  }

  /* ---- banner ---- */

  var STYLE = [
    '#eol-consent{position:fixed;left:0;right:0;bottom:0;z-index:10000;',
    'background:var(--card,#fff);color:var(--text,#1d2b3a);',
    'border-top:3px solid var(--gold,#c9a227);',
    'box-shadow:0 -4px 24px rgba(26,58,92,.18);',
    'font-family:"Segoe UI",system-ui,sans-serif;font-size:.88rem;line-height:1.5;',
    'padding:1rem 1.1rem calc(1rem + env(safe-area-inset-bottom,0px))}',
    '#eol-consent .cc-in{max-width:62rem;margin:0 auto;display:flex;flex-wrap:wrap;',
    'gap:.9rem 1.4rem;align-items:center;justify-content:space-between}',
    '#eol-consent .cc-txt{flex:1 1 20rem;min-width:0}',
    '#eol-consent .cc-txt b{display:block;font-size:.95rem;margin-bottom:.25rem;color:var(--blue,#1a3a5c)}',
    '#eol-consent .cc-en{display:block;color:var(--muted,#6b7a8d);margin-top:.3rem}',
    '#eol-consent a{color:var(--teal,#2b7a78);font-weight:600}',
    '#eol-consent .cc-btns{display:flex;flex-wrap:wrap;gap:.6rem;flex:0 0 auto}',
    /* Equal size and weight on purpose: refusing must be no harder than agreeing. */
    '#eol-consent button{font-family:inherit;font-size:.88rem;font-weight:700;',
    'padding:.6rem 1.3rem;border-radius:8px;cursor:pointer;border:2px solid var(--blue,#1a3a5c);',
    'min-width:10.5rem;flex:1 1 auto}',
    '#eol-consent .cc-no{background:transparent;color:var(--blue,#1a3a5c)}',
    '#eol-consent .cc-yes{background:var(--blue,#1a3a5c);color:#fff}',
    '#eol-consent button:hover{opacity:.88}',
    '#eol-consent button:focus-visible{outline:3px solid var(--gold,#c9a227);outline-offset:2px}',
    '#eol-consent-link{background:none;border:0;padding:0;font:inherit;color:inherit;',
    'cursor:pointer;text-decoration:underline;font-weight:600}',
    '@media (max-width:560px){#eol-consent .cc-btns{width:100%}}',
    '@media (prefers-color-scheme:dark){',
    '#eol-consent{background:#16212d;color:#e6edf5;box-shadow:0 -4px 24px rgba(0,0,0,.55)}',
    '#eol-consent .cc-txt b{color:#9cc9f5}',
    '#eol-consent .cc-en{color:#93a2b4}',
    '#eol-consent button{border-color:#9cc9f5}',
    '#eol-consent .cc-no{color:#9cc9f5}',
    '#eol-consent .cc-yes{background:#9cc9f5;color:#0f1720}}'
  ].join('');

  function injectStyle() {
    if (document.getElementById('eol-consent-style')) return;
    var s = document.createElement('style');
    s.id = 'eol-consent-style';
    s.textContent = STYLE;
    (document.head || document.documentElement).appendChild(s);
  }

  function close() {
    var el = document.getElementById('eol-consent');
    if (el) el.remove();
  }

  function show() {
    if (document.getElementById('eol-consent')) return;
    injectStyle();
    var box = document.createElement('div');
    box.id = 'eol-consent';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Cookie-Einstellungen / Cookie settings');
    box.innerHTML =
      '<div class="cc-in">'
      + '<div class="cc-txt" lang="de"><b>Cookies und Statistik</b>'
      + 'Wir nutzen Google Analytics, um zu sehen, welche Übungen genutzt werden. '
      + 'Dabei werden Daten an Google übertragen. Ohne deine Zustimmung passiert das nicht. '
      + 'Die Übungen funktionieren auch ohne. '
      + '<a href="https://englishonline.training/privacy-policy/">Datenschutz</a>'
      + '<span class="cc-en" lang="en">We use Google Analytics to see which exercises get used. '
      + 'Nothing is sent to Google unless you agree. The exercises work either way. '
      + '<a href="https://englishonline.training/privacy-policy/">Privacy policy</a></span>'
      + '</div>'
      + '<div class="cc-btns">'
      + '<button type="button" class="cc-no" id="eol-cc-no">Ablehnen · Decline</button>'
      + '<button type="button" class="cc-yes" id="eol-cc-yes">Einverstanden · Accept</button>'
      + '</div></div>';
    document.body.appendChild(box);
    document.getElementById('eol-cc-yes').addEventListener('click', function () {
      write('granted'); grant(); close();
    });
    document.getElementById('eol-cc-no').addEventListener('click', function () {
      write('denied'); deny(); close();
    });
    document.getElementById('eol-cc-no').focus();
  }

  /* ---- the "Cookie-Einstellungen" footer link ----
   * Added on window load, not DOMContentLoaded: exercise.js injects the footer
   * from its own DOMContentLoaded handler, which runs after this file's would. */
  function addFooterLink() {
    if (document.getElementById('eol-consent-link')) return;
    var footers = document.querySelectorAll('.eol-footer .legal, .eol-footer, .site-footer, footer');
    var host = footers.length ? footers[footers.length - 1] : null;
    if (!host) return;
    var sep = document.createTextNode(' · ');
    var b = document.createElement('button');
    b.type = 'button';
    b.id = 'eol-consent-link';
    b.lang = 'de';
    b.textContent = 'Cookie-Einstellungen';
    b.addEventListener('click', show);
    host.appendChild(sep);
    host.appendChild(b);
  }

  window.eolConsent = {
    open: show,
    state: function () { return read() || 'unset'; }
  };

  function init() {
    if (!read()) show();
    addFooterLink();
  }

  if (document.readyState === 'complete') init();
  else window.addEventListener('load', init);
})();
