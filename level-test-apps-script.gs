/**
 * EnglishOnline.training — Level Test results handler
 * Bound to its own "Level Test Results" Google Sheet — NOT the shared
 * apps-script.gs. level-test.html posts here only when a student asks for
 * extra feedback by email.
 *
 * Install: open the sheet → Extensions → Apps Script → paste → Deploy →
 * New deployment → Web app (Execute as: Me, Who has access: Anyone).
 * Put the /exec URL into SHEET_URL in level-test.html.
 * To update later: Deploy → Manage deployments → edit → New version.
 */

// Abuse limits: anyone can POST to a web app, so cap how much mail it sends.
var MAX_PER_DAY     = 80;  // all addresses together (stays under MailApp's quota)
var MAX_PER_ADDRESS = 3;   // per address per day

function doPost(e) {
  try {
    var raw = (e.parameter && e.parameter.payload)
      ? e.parameter.payload
      : (e.postData ? e.postData.contents : '');
    var data = JSON.parse(raw);
    if (data.unit !== 'level-test') return text('Ignored');
    handleLevelTest(data);
    return text('OK');
  } catch (err) {
    return text('Error: ' + err.message);
  }
}

function text(s) {
  return ContentService.createTextOutput(s).setMimeType(ContentService.MimeType.TEXT);
}

function handleLevelTest(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Results');
  if (!sheet) {
    sheet = ss.insertSheet('Results');
    sheet.appendRow(['Timestamp', 'Email', 'Level', 'Score', 'Breakdown', 'Sent']);
  }

  var email = String(data.email || '').trim().toLowerCase();
  var status;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    status = 'no — invalid email';
  } else {
    status = allowSend(email);
    if (status === 'yes') sendFeedback(email, data);
  }
  sheet.appendRow([new Date(), email, cap(data.level, 60), cap(data.score, 20), cap(data.breakdown, 100), status]);
}

// Daily counters in script properties, keyed by date; old days are cleared.
function allowSend(email) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var props = PropertiesService.getScriptProperties();
    var today = Utilities.formatDate(new Date(), 'Europe/Berlin', 'yyyy-MM-dd');
    var counts = JSON.parse(props.getProperty('counts') || '{}');
    if (counts.day !== today) counts = { day: today, total: 0, by: {} };
    if (counts.total >= MAX_PER_DAY) return 'no — daily limit reached';
    if ((counts.by[email] || 0) >= MAX_PER_ADDRESS) return 'no — address limit reached';
    counts.total++;
    counts.by[email] = (counts.by[email] || 0) + 1;
    props.setProperty('counts', JSON.stringify(counts));
    return 'yes';
  } finally {
    lock.releaseLock();
  }
}

function cap(v, n) { return String(v || '').substring(0, n); }

// Plain text with length caps, so the endpoint can't send long or HTML mail.
function sendFeedback(email, data) {
  var body = 'Your English level test result\n\n'
    + 'Estimated level: ' + cap(data.level, 60) + '\n'
    + 'Score: ' + cap(data.score, 20) + '\n'
    + 'By level: ' + cap(data.breakdown, 100) + '\n\n'
    + cap(data.advice, 400) + '\n\n'
    + (data.mistakes ? 'Questions you missed:\n\n' + cap(data.mistakes, 6000) + '\n\n' : 'You made no mistakes — well done!\n\n')
    + 'Exercises to work on next:\n' + cap(data.links, 600) + '\n\n'
    + 'This is a grammar-based estimate, not a full exam — speaking, listening and writing also count towards your real CEFR level.\n\n'
    + 'EnglishOnline.training — https://activities.englishonline.training/level-test.html';
  MailApp.sendEmail({ to: email, subject: 'Your English level test feedback', body: body, name: 'EnglishOnline.training' });
}
