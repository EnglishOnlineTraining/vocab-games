/**
 * EnglishOnline.training — Google Sheets submission handler
 * Runs in the sheet the Business, University, IT and IELTS pages post to (the
 * Apps Script URL in docs/claude-reference/submission-routing.md). Years 7–10,
 * MSA and Abitur go to Make webhooks instead, not to this script.
 *
 * To update: open that sheet → Extensions → Apps Script, replace all the code
 * with this file, save, then Deploy → Manage deployments → edit (pencil) →
 * Version: New version → Deploy. Editing the existing deployment keeps the URL;
 * "New deployment" would create a new one that no page uses.
 *
 * This universal version auto-creates a cleanly-named tab for ANY unit, so
 * newly generated exercises (Business English, University, daily drafts, etc.)
 * route correctly WITHOUT needing a redeploy. Only add a custom block below
 * if an exercise needs a bespoke column layout.
 */

function doPost(e) {
  try {
    var raw = (e.parameter && e.parameter.payload)
      ? e.parameter.payload
      : (e.postData ? e.postData.contents : '');
    var data = JSON.parse(raw);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    routeSubmission(ss, data);
    return ContentService.createTextOutput('OK').setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    return ContentService.createTextOutput('Error: ' + err.message).setMimeType(ContentService.MimeType.TEXT);
  }
}

/**
 * Spreadsheet formula injection (docs/CODE-REVIEW-FINDINGS.md #2). A submitted
 * value starting with = + - @ (or a tab/CR) would land in the sheet as a live
 * formula: a student typing =HYPERLINK(...) or =IMPORTRANGE(...) into a textarea.
 * A leading apostrophe makes Sheets store it as text; the apostrophe itself is
 * not shown and not part of the cell's value.
 */
function safeCell(v) {
  return (typeof v === 'string' && /^[=+\-@\t\r]/.test(v)) ? "'" + v : v;
}

function appendRowSafe(sheet, row) {
  sheet.appendRow(row.map(safeCell));
}

function getSheet(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) { sheet = ss.insertSheet(name); sheet.appendRow(headers); }
  return sheet;
}

function flatten(obj) {
  if (!obj || typeof obj !== 'object') return String(obj || '');
  return Object.keys(obj).map(function(k) { return k + ': ' + (obj[k] || '(blank)'); }).join('\n');
}

/**
 * Turn a kebab-case unit like "9g-famous-hollywood" into a tidy tab title
 * like "9g Famous Hollywood". Sheet tab names are capped at 100 chars.
 */
function titleFromUnit(unit) {
  var t = String(unit || 'unknown')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, function(c) { return c.toUpperCase(); });
  return t.substring(0, 95);
}

// Known units that should get a fixed, friendly tab name.
var TAB_NAMES = {
  'california-exercises':        'California Exercises',
  'california-hazards':          'California Hazards',
  '9g-famous-hollywood':         'Famous & Hollywood',
  'robert-the-bruce-7c':         'Robert the Bruce',
  'tudor-past-perfect':          'Tudor Past Perfect',
  '9c-south-africa-revision':    'South Africa Revision',
  'sport-south-africa':          'Sport in South Africa',
  '7g-amazon-rainforest-reading': 'Amazon Rainforest Reading',
  '9g-ev-renewable-energy-reading': 'EV & Renewable Energy Reading'
};

function routeSubmission(ss, data) {
  var unit = data.unit || 'unknown';
  var tabName = TAB_NAMES[unit] || titleFromUnit(unit);

  // ----- Custom layouts (bespoke columns) -----
  if (unit === 'california-exercises') {
    var sheet = getSheet(ss, tabName, ['Timestamp','Name','Class','Ex 12','Ex 13','Ex 14','Ex 15','Ex 18','Ex 19']);
    appendRowSafe(sheet, [new Date(), data.name||'', data.cls||'',
      JSON.stringify(data.ex12||''), JSON.stringify(data.ex13||''),
      JSON.stringify(data.ex14||''), JSON.stringify(data.ex15||''),
      JSON.stringify(data.ex18||''), JSON.stringify(data.ex19||'')]);
    return;
  }

  if (unit === 'california-hazards') {
    var exA=data.exA||{}, exB=data.exB||{}, exC=data.exC||{}, exD=data.exD||{};
    var gaps=[1,2,3,4,5,6,7,8].map(function(i){return 'Gap '+i+': '+(exB['g'+i]||'(blank)');}).join('\n');
    var trs=[1,2,3,4,5,6].map(function(i){return i+'. '+(exC['t'+i]||'(blank)');}).join('\n');
    var sheet = getSheet(ss, tabName, ['Timestamp','Name','Class','Ex A – Problems','Ex A – Connection','Ex B – Modal gaps','Ex C – Transforms','Ex D – Paragraph','Ex D – Opinion']);
    appendRowSafe(sheet, [new Date(), data.name||'', data.cls||'', exA.a||'', exA.b||'', gaps, trs, exD.para||'', exD.opinion||'']);
    return;
  }

  if (unit === '7g-amazon-rainforest-reading') {
    var sheet = getSheet(ss, tabName, ['Timestamp','Name','Class','Ex A – Finding Facts','Ex B – More Detail']);
    appendRowSafe(sheet, [new Date(), data.name||'', data.cls||'', JSON.stringify(data.exA||{}), JSON.stringify(data.exB||{})]);
    return;
  }

  if (unit === '9g-ev-renewable-energy-reading') {
    var sheet = getSheet(ss, tabName, ['Timestamp','Name','Class','Ex A – Electric Vehicles','Ex B – Renewable Energy']);
    appendRowSafe(sheet, [new Date(), data.name||'', data.cls||'', JSON.stringify(data.exA||{}), JSON.stringify(data.exB||{})]);
    return;
  }

  // ----- IELTS: one tab for every ielts-* unit -----
  // IELTS learners send an email address and a newsletter opt-in, never a name
  // (privacy policy, §7). "Feedback sent" and "Added to MailerLite" are left blank
  // for the feedback step to fill in: it adds opted-in addresses to MailerLite and
  // marks the row, so no API key is kept here. See submission-routing.md.
  if (unit.indexOf('ielts-') === 0) {
    appendDynamic(ss, 'IELTS',
      ['Timestamp', 'Unit', 'Email', 'Newsletter', 'Feedback sent', 'Added to MailerLite'],
      [new Date(), unit, data.email || '', data.newsletter === 'yes' ? 'yes' : 'no', '', ''],
      data, ['unit', 'email', 'newsletter', 'name', 'cls', 'grade']);
    return;
  }

  // ----- Universal handler: works for every other unit, no redeploy needed -----
  appendDynamic(ss, tabName, ['Timestamp', 'Name', 'Class'],
    [new Date(), data.name || '', data.cls || ''], data, ['name', 'cls', 'unit']);
}

/**
 * Append one row: the fixed columns first, then one column per answer key the
 * exercise sends (everything in `data` not listed in `skip`). Builds the header
 * on first use and adds a column for any key the header does not have yet.
 */
function appendDynamic(ss, tabName, fixedHeaders, fixedValues, data, skip) {
  var keys = Object.keys(data).filter(function(k){ return skip.indexOf(k) === -1; });
  var headers = fixedHeaders.concat(keys);

  var sheet = ss.getSheetByName(tabName);
  if (!sheet) {
    sheet = ss.insertSheet(tabName);
    appendRowSafe(sheet, headers);   // headers are the submitted keys
  } else {
    // If this exercise introduces answer keys not yet in the header row, append them.
    var existing = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
    var added = false;
    keys.forEach(function(k){
      if (existing.indexOf(k) === -1) { existing.push(k); added = true; }
    });
    if (added) sheet.getRange(1, 1, 1, existing.length).setValues([existing.map(safeCell)]);
    headers = existing;
  }

  // Map values to the (possibly extended) header order.
  var rowMap = {};
  fixedHeaders.forEach(function(h, i){ rowMap[h] = fixedValues[i]; });
  keys.forEach(function(k){ rowMap[k] = flatten(data[k]); });
  var row = headers.map(function(h){ return (h in rowMap) ? rowMap[h] : ''; });
  appendRowSafe(sheet, row);
}

/* ============================================================
   ITEM STATS — agent #11 (docs/agent-backlog.md)
   GET <exec URL>?action=itemstats&token=<ITEMSTATS_TOKEN>[&since=YYYY-MM-DD]
   Returns per-gap counts for every unit that has an answer key and a tab here.
   Never returns a name, class, email, timestamp or free text: a wrong answer is
   listed only when at least 2 learners gave it and it is 40 characters or fewer,
   everything else is counted under "(other)". Writing fields return counts and a
   median word count only. Mirrors scripts/item-analysis.js (addSubmission /
   finishUnit); test-item-analysis.js checks the two agree.
   ============================================================ */

var KEYS_BASE = 'https://activities.englishonline.training/data/answer-keys/';
var IS_BLANK = '(blank)', IS_BLANK_LEGACY = '—';
var IS_WRONG_MIN = 2, IS_WRONG_MIN_TYPED = 3, IS_WRONG_MAX_LEN = 40;
// A field id as pages name them (g1, para). Lowercase first letter, so a learner's
// line starting "Name: …" is never read as one.
var IS_FIELD = /^[a-z][\w-]{0,30}$/;
function isHas_(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }
// Bespoke-column units: their cells are JSON or "Gap n:" text, not flatten() output.
var IS_CUSTOM = ['california-exercises', 'california-hazards', '7g-amazon-rainforest-reading',
                 '9g-ev-renewable-energy-reading'];

function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.action !== 'itemstats') return isJson_({ error: 'unknown action' });
  var want = PropertiesService.getScriptProperties().getProperty('ITEMSTATS_TOKEN');
  if (!want || p.token !== want) return isJson_({ error: 'forbidden' });
  try {
    return isJson_(itemStats(SpreadsheetApp.getActiveSpreadsheet(), p.since || '', isLoader_()));
  } catch (err) {
    return isJson_({ error: err.message });
  }
}

function isJson_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

/* Keys come from the live site, fetched in parallel and cached for 6 hours. */
function isLoader_() {
  var cache = CacheService.getScriptCache();
  function getJson(names, ttl) {
    var out = {}, missing = [];
    var hit = cache.getAll(names.map(function (n) { return 'ak:' + n; }));
    names.forEach(function (n) {
      if (hit['ak:' + n]) out[n] = JSON.parse(hit['ak:' + n]); else missing.push(n);
    });
    if (!missing.length) return out;
    var res = UrlFetchApp.fetchAll(missing.map(function (n) {
      return { url: KEYS_BASE + encodeURIComponent(n) + '.json', muteHttpExceptions: true };
    }));
    var put = {};
    res.forEach(function (r, i) {
      if (r.getResponseCode() !== 200) return;
      var body = r.getContentText();
      out[missing[i]] = JSON.parse(body);
      if (body.length < 90000) put['ak:' + missing[i]] = body;
    });
    if (Object.keys(put).length) cache.putAll(put, ttl);
    return out;
  }
  return {
    index: function () {
      var i = getJson(['index'], 3600).index;
      if (!i) throw new Error('answer-keys/index.json not reachable');
      return i.units;
    },
    keys: function (units) { return getJson(units, 21600); }
  };
}

function itemStats(ss, since, loader) {
  var sinceDate = null;
  if (since) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(since)) throw new Error('since must be YYYY-MM-DD');
    sinceDate = new Date(since + 'T00:00:00Z');
  }
  var sheets = {};
  ss.getSheets().forEach(function (s) { sheets[s.getName()] = s; });

  // Unit -> tabs, the way routeSubmission names them. IELTS units share one tab;
  // rows sent before that change sit in a per-unit tab, so read both.
  var want = [], tabsOf = {}, used = {};
  loader.index().forEach(function (u) {
    if (IS_CUSTOM.indexOf(u) !== -1) return;
    var own = TAB_NAMES[u] || titleFromUnit(u);
    var tabs = (u.indexOf('ielts-') === 0 ? ['IELTS', own] : [own])
      .filter(function (t) { return sheets[t]; });
    if (!tabs.length) return;
    want.push(u); tabsOf[u] = tabs;
    tabs.forEach(function (t) { used[t] = true; });
  });
  var keys = loader.keys(want);
  var values = {};

  var units = {};
  want.forEach(function (u) {
    var key = keys[u];
    if (!key || !key.sections) return;
    var subs = [];
    tabsOf[u].forEach(function (tab) {
      var v = values[tab] || (values[tab] = sheets[tab].getDataRange().getValues());
      var head = v[0].map(String), ti = head.indexOf('Timestamp'), ui = head.indexOf('Unit');
      for (var r = 1; r < v.length; r++) {
        if (tab === 'IELTS' && String(v[r][ui]) !== u) continue;
        if (sinceDate && !(v[r][ti] instanceof Date && v[r][ti] >= sinceDate)) continue;
        var sections = {};
        head.forEach(function (h, c) {
          if (isHas_(key.sections, h) || /^ex/i.test(h)) sections[h] = isParseCell_(v[r][c]);
        });
        subs.push(sections);
      }
    });
    if (subs.length) units[u] = itemStatsForUnit(key, subs);
  });

  // Tabs that look like submission tabs (Timestamp, Name, Class) but match no keyed
  // unit. Other tabs (Shaun's own) are never named in the output.
  var unmatched = Object.keys(sheets).filter(function (t) {
    if (used[t] || IS_CUSTOM.some(function (u) { return (TAB_NAMES[u] || titleFromUnit(u)) === t; })) return false;
    var h = sheets[t].getRange(1, 1, 1, 3).getValues()[0].map(String);
    return h[0] === 'Timestamp' && h[1] === 'Name' && h[2] === 'Class';
  }).sort();
  return { generated: new Date().toISOString(), since: since || null, units: units, unmatchedTabs: unmatched };
}

/* Reverse of flatten(): "g1: x\ng2: y" -> { g1: 'x', g2: 'y' }. A line that does not
   start a new "field: " continues the previous value (a paragraph with line breaks).
   A cell that does not start with a field is a plain-string section (a page that
   sends exD as one text): it stays one field, "text", never split into ids. */
function isParseCell_(cell) {
  var s = String(cell == null ? '' : cell), out = {}, last = null;
  if (!s) return out;
  var first = /^([^:\n]*): /.exec(s);
  if (!first || !IS_FIELD.test(first[1])) { out.text = s; return out; }
  s.split('\n').forEach(function (line) {
    var m = /^([^:]*): ([\s\S]*)$/.exec(line);   // flatten() always writes ": "
    if (m && IS_FIELD.test(m[1])) { last = m[1]; out[last] = m[2]; }
    else if (last) out[last] += '\n' + line;
  });
  return out;
}

function isNormAns_(s) {
  return String(s == null ? '' : s)
    .replace(/[‘’ʼ´`]/g, "'")
    .toLowerCase()
    .replace(/[.,!?;:]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isBlank_(v, gap) {
  if (v == null || v === '' || v === IS_BLANK) return true;
  return v === IS_BLANK_LEGACY && !(gap && gap.accept.indexOf(IS_BLANK_LEGACY) !== -1);
}

function itemStatsForUnit(key, subs) {
  var gaps = {}, writing = {};
  subs.forEach(function (sections) {
    Object.keys(key.sections).forEach(function (sk) {
      var sec = key.sections[sk], given = sections[sk] || {};
      Object.keys(sec.gaps).forEach(function (g) {
        var gap = sec.gaps[g], id = sk + '.' + g, v = given[g];
        var c = gaps[id] || (gaps[id] = { correct: 0, blank: 0, wrong: Object.create(null), typed: !!sec.typed });
        if (isBlank_(v, gap)) { c.blank++; return; }
        var shown = sec.typed ? isNormAns_(v) : String(v);
        var ok = sec.typed
          ? gap.accept.some(function (a) { return isNormAns_(a) === shown; })
          : gap.accept.indexOf(v) !== -1;
        if (ok) c.correct++; else c.wrong[shown] = (c.wrong[shown] || 0) + 1;
      });
    });
    Object.keys(sections).forEach(function (sk) {
      if (!/^ex/i.test(sk)) return;
      var graded = (isHas_(key.sections, sk) && key.sections[sk].gaps) || {};
      Object.keys(sections[sk]).forEach(function (f) {
        if (isHas_(graded, f) || !IS_FIELD.test(f)) return;
        var id = sk + '.' + f, t = sections[sk][f];
        var w = writing[id] || (writing[id] = { n: 0, blank: 0, words: [] });
        w.n++;
        if (isBlank_(t)) w.blank++;
        else { var s = String(t).trim(); w.words.push(s ? s.split(/\s+/).length : 0); }
      });
    });
  });

  var out = { rows: subs.length, gaps: {}, writing: {} };
  Object.keys(gaps).forEach(function (id) {
    var c = gaps[id], wrong = Object.create(null), min = c.typed ? IS_WRONG_MIN_TYPED : IS_WRONG_MIN;
    Object.keys(c.wrong).forEach(function (a) {
      var k = (c.wrong[a] >= min && a.length <= IS_WRONG_MAX_LEN && a.indexOf('@') === -1) ? a : '(other)';
      wrong[k] = (wrong[k] || 0) + c.wrong[a];
    });
    out.gaps[id] = { correct: c.correct, blank: c.blank, wrong: wrong };
  });
  Object.keys(writing).forEach(function (id) {
    if (writing[id].n < Math.max(IS_WRONG_MIN, Math.ceil(subs.length / 2))) return;   // stray "word: " line
    var w = writing[id], s = w.words.slice().sort(function (a, b) { return a - b; }), m = s.length >> 1;
    out.writing[id] = { n: w.n, blank: w.blank,
      medianWords: !s.length ? 0 : s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2 };
  });
  return out;
}
