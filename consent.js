/*
 * consent.js — Google Tag Manager only after the visitor says yes.
 *
 * GTM (and the Google Analytics it loads) sets cookies and sends data to
 * Google, which German law (TTDSG §25, DSGVO) allows only after opt-in. Until
 * 2026-10-04 every page loaded GTM straight away. build-head.js now puts this
 * file in every page's <head> instead of the GTM snippet.
 *
 *   - No choice yet: a small banner, "Ablehnen" and "Akzeptieren" equally
 *     prominent. Nothing from Google loads.
 *   - Accepted: GTM loads, now and on later visits.
 *   - Declined: nothing loads and the banner stays away.
 *   - "Cookie-Einstellungen" (added to the page footer) clears the choice and
 *     shows the banner again, so consent can be withdrawn as easily as given.
 *
 * Inside an iframe (klasse7-mini is embedded on WordPress) there is no banner
 * and no GTM: the host page is responsible for its own consent.
 * The choice is kept in localStorage under "eol_consent". If storage is blocked,
 * the banner simply appears again on the next page.
 */
(function () {
  'use strict';
  var KEY = 'eol_consent';
  var GTM_ID = 'GTM-5HXNNPCS';
  var PRIVACY = 'https://englishonline.training/privacy-policy/';

  if (window.self !== window.top) return;

  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) { /* banner returns next page */ } }

  var loaded = false;
  function loadGtm() {
    if (loaded) return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtm.js?id=' + GTM_ID;
    document.head.appendChild(s);
  }

  function style() {
    if (document.getElementById('eol-consent-style')) return;
    var st = document.createElement('style');
    st.id = 'eol-consent-style';
    st.textContent =
      '#eol-consent{position:fixed;left:0;right:0;bottom:0;z-index:9999;background:#1a3a5c;color:#fff;'
      + 'padding:.9rem 1rem;font:14px/1.45 system-ui,-apple-system,"Segoe UI",sans-serif;box-shadow:0 -2px 12px rgba(0,0,0,.25)}'
      + '#eol-consent .in{max-width:860px;margin:0 auto;display:flex;flex-wrap:wrap;gap:.6rem 1rem;align-items:center}'
      + '#eol-consent p{margin:0;flex:1 1 320px}'
      + '#eol-consent a{color:#ffd166}'
      + '#eol-consent .btns{display:flex;gap:.5rem;flex:0 0 auto}'
      + '#eol-consent button{font:inherit;font-weight:700;padding:.5rem 1rem;border-radius:8px;cursor:pointer;'
      + 'border:2px solid #ffd166;min-width:7.5rem}'
      + '#eol-consent .no{background:transparent;color:#fff}'
      + '#eol-consent .yes{background:#ffd166;color:#1a3a5c}'
      + '#eol-consent button:focus-visible{outline:3px solid #fff;outline-offset:2px}'
      + '.eol-consent-link{background:none;border:0;padding:0;font:inherit;color:inherit;text-decoration:underline;cursor:pointer}';
    document.head.appendChild(st);
  }

  function banner() {
    if (document.getElementById('eol-consent')) return;
    style();
    var b = document.createElement('div');
    b.id = 'eol-consent';
    b.setAttribute('role', 'region');
    b.setAttribute('aria-label', 'Cookie-Einstellungen');
    b.innerHTML = '<div class="in">'
      + '<p lang="de">Darf ich mit <strong>Google Analytics</strong> zählen, welche Übungen genutzt werden? '
      + 'Dafür werden Cookies gesetzt und Daten an Google (USA) übertragen. Alle Übungen funktionieren auch ohne. '
      + 'Unter 16? Frag bitte vorher deine Eltern. <a href="' + PRIVACY + '">Datenschutz</a>'
      + '<br><span lang="en" style="opacity:.85">May I use Google Analytics to count which exercises are used? '
      + 'Everything works if you say no.</span></p>'
      + '<div class="btns"><button type="button" class="no">Ablehnen</button>'
      + '<button type="button" class="yes">Akzeptieren</button></div></div>';
    b.querySelector('.no').addEventListener('click', function () { set('denied'); b.remove(); });
    b.querySelector('.yes').addEventListener('click', function () { set('granted'); b.remove(); loadGtm(); });
    document.body.appendChild(b);
  }

  // A way back to the banner, in whatever footer the page has.
  function settingsLink() {
    if (document.querySelector('.eol-consent-link')) return;
    style();
    var host = document.querySelector('.eol-footer .legal, .site-footer, footer') || document.body;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'eol-consent-link';
    btn.textContent = 'Cookie-Einstellungen';
    btn.addEventListener('click', function () {
      try { localStorage.removeItem(KEY); } catch (e) { /* nothing stored */ }
      banner();
      var first = document.querySelector('#eol-consent button');
      if (first) first.focus();
    });
    var wrap = document.createElement(host === document.body ? 'p' : 'span');
    if (host === document.body) wrap.style.cssText = 'text-align:center;font-size:.8rem;margin:1.5rem 0';
    else wrap.appendChild(document.createTextNode(' · '));
    wrap.appendChild(btn);
    host.appendChild(wrap);
  }

  var choice = get();
  if (choice === 'granted') loadGtm();

  function ready() {
    if (choice !== 'granted' && choice !== 'denied') banner();
    // exercise.js injects its footer on DOMContentLoaded; wait a tick for it.
    setTimeout(settingsLink, 0);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  else ready();
})();
