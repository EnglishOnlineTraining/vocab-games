/*
 * signup.js — the site's own newsletter form, posting to a MailerLite form.
 *
 * Until 2026-10-15 these pages loaded MailerLite's universal.js and showed the
 * form designed in the MailerLite dashboard. Those designs were MailerLite's
 * default English template ("Signup for news and special offers!", with an
 * advertising-consent checkbox), and universal.js loaded before any consent.
 * Now the form is ours: site styles, page language, no third-party script.
 *
 * Each page puts the heading and intro in its own HTML, then:
 *
 *   <div class="eol-signup" data-ml-form="194481680761750752" data-lang="de"></div>
 *   <script src="signup.js" defer></script>
 *
 * data-ml-form is the MailerLite form ID (the long number, not the slug).
 * The form decides the group and keeps double opt-in, so MailerLite still
 * sends the confirmation email and nobody joins a group before they click it.
 *
 *   Page                                 Form ID              Group
 *   msa-c-american-dream.html            194481680761750752   EOL – MSA
 *   lead-msa-checkliste.html             194481680761750752   EOL – MSA
 *   lead-abitur-textanalyse.html         194481679194129434   EOL – Abitur
 *   lead-business-email-phrasebank.html  194481682855757151   EOL – Business English
 *   lead-teachers-three-tasks.html       194481686730245820   EOL – Teachers
 *   lead-story-structures.html           200478242193278763   General
 *
 * The endpoint is the one MailerLite's own embed code posts to. It is not part
 * of their documented API, so if signups stop, check it here first.
 */
(function () {
  'use strict';
  var ENDPOINT = 'https://assets.mailerlite.com/jsonp/2491182/forms/';
  var PRIVACY = 'https://englishonline.training/privacy-policy/';

  var TEXT = {
    de: {
      label: 'E-Mail-Adresse',
      button: 'Anmelden',
      sending: 'Wird gesendet …',
      // German pages are for students (MSA, Abitur); under 16 needs a parent's OK (DSGVO Art. 8).
      note: 'Du bekommst zuerst eine E-Mail zur Bestätigung. Abmelden geht jederzeit. Unter 16? Dann melde dich bitte nur mit Erlaubnis deiner Eltern an.',
      privacy: 'Datenschutz',
      done: 'Fast geschafft: Bitte klick auf den Link in der E-Mail, die wir dir gerade geschickt haben. Sie ist nicht da? Schau im Spam-Ordner nach.',
      fail: 'Das hat nicht geklappt. Bitte prüf deine E-Mail-Adresse und versuch es noch einmal.'
    },
    en: {
      label: 'Email address',
      button: 'Sign up',
      sending: 'Sending …',
      note: 'We send you an email to confirm first. You can unsubscribe at any time.',
      privacy: 'Privacy policy',
      done: 'Almost done: please click the link in the email we just sent you. Not there? Check your spam folder.',
      fail: 'That did not work. Please check your email address and try again.'
    }
  };

  var CSS = ''
    + '.eol-signup form{display:flex;flex-wrap:wrap;gap:.5rem;justify-content:center;margin:0}'
    + '.eol-signup label{flex-basis:100%;font-size:.88rem;font-weight:600;color:var(--text,#1d2b3a);text-align:center}'
    + '.eol-signup input[type=email]{flex:1 1 14rem;max-width:22rem;min-height:2.75rem;padding:.55rem .75rem;font:inherit;font-size:1rem;'
    + 'color:var(--text,#1d2b3a);background:var(--card,#fff);border:1px solid var(--border,#dce3ec);border-radius:8px}'
    + '.eol-signup button{min-height:2.75rem;padding:.55rem 1.2rem;font:inherit;font-size:1rem;font-weight:600;color:#fff;'
    + 'background:var(--blue,#1a3a5c);border:0;border-radius:8px;cursor:pointer}'
    + '.eol-signup button[disabled]{opacity:.6;cursor:default}'
    + '.eol-signup .eol-signup-hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}'
    + '.eol-signup .eol-signup-note{margin:.6rem 0 0;font-size:.8rem;color:var(--muted,#6b7a8d);text-align:center}'
    + '.eol-signup .eol-signup-note a{color:inherit}'
    + '.eol-signup .eol-signup-status{margin:.6rem 0 0;font-size:.9rem;text-align:center;color:var(--text,#1d2b3a)}'
    + '.eol-signup .eol-signup-status:empty{display:none}';

  function el(tag, attrs, text) {
    var e = document.createElement(tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text) e.textContent = text;
    return e;
  }

  function render(box, n) {
    var formId = box.getAttribute('data-ml-form');
    if (!/^\d+$/.test(formId || '')) return;
    var t = TEXT[box.getAttribute('data-lang')] || TEXT.en;
    var id = 'eol-signup-email-' + n;

    // Without JS the form still posts; MailerLite then answers in a new tab.
    var form = el('form', { action: ENDPOINT + formId + '/subscribe', method: 'post', target: '_blank', novalidate: '' });
    var label = el('label', { 'for': id }, t.label);
    var email = el('input', { type: 'email', id: id, name: 'fields[email]', required: '', autocomplete: 'email', inputmode: 'email' });
    // Honeypot: people never see or fill it; form-filling bots usually do.
    var hp = el('div', { 'class': 'eol-signup-hp', 'aria-hidden': 'true' });
    hp.appendChild(el('input', { type: 'text', name: 'website', tabindex: '-1', autocomplete: 'off' }));
    var btn = el('button', { type: 'submit' }, t.button);
    form.appendChild(label);
    form.appendChild(email);
    form.appendChild(hp);
    form.appendChild(btn);

    var note = el('p', { 'class': 'eol-signup-note' }, t.note + ' ');
    note.appendChild(el('a', { href: PRIVACY }, t.privacy));
    var status = el('p', { 'class': 'eol-signup-status', role: 'status', 'aria-live': 'polite' });

    box.appendChild(form);
    box.appendChild(note);
    box.appendChild(status);

    // exercise.js blocks paste in every input; an email address must be pastable.
    form.addEventListener('paste', function (ev) { ev.stopPropagation(); }, true);

    function finish(ok) {
      if (ok) {
        form.hidden = true;
        note.hidden = true;
        status.textContent = t.done;
      } else {
        btn.disabled = false;
        btn.textContent = t.button;
        status.textContent = t.fail;
        email.focus();
      }
    }

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (!email.checkValidity() || !email.value.trim()) { finish(false); return; }
      if (hp.firstChild.value) { finish(true); return; }
      btn.disabled = true;
      btn.textContent = t.sending;
      status.textContent = '';

      var data = new FormData();
      data.append('fields[email]', email.value.trim());
      data.append('ml-submit', '1');
      data.append('anticsrf', 'true');

      fetch(ENDPOINT + formId + '/subscribe', { method: 'POST', body: data })
        .then(function (r) {
          return r.json().then(function (j) { return r.ok && !!j && j.success === true; },
                               function () { return false; });
        }, function () {
          // The request left but the answer is unreadable (a CORS block). It
          // most likely arrived, and sending it twice would mean two emails.
          return navigator.onLine !== false;
        })
        .then(finish);
    });
  }

  var boxes = document.querySelectorAll('.eol-signup[data-ml-form]');
  if (!boxes.length) return;
  document.head.appendChild(el('style', {}, CSS));
  for (var i = 0; i < boxes.length; i++) render(boxes[i], i);
})();
