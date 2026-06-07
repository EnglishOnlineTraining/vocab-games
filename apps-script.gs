/**
 * EnglishOnline.training — Google Sheets submission handler
 * Paste into BOTH the Year 7 sheet and Year 9 sheet (Extensions → Apps Script),
 * then Deploy → Manage deployments → edit → New version (keeps the same URL).
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
  'california-exercises':     'California Exercises',
  'california-hazards':       'California Hazards',
  '9g-famous-hollywood':      'Famous & Hollywood',
  'robert-the-bruce-7c':      'Robert the Bruce',
  'tudor-past-perfect':       'Tudor Past Perfect',
  '9c-south-africa-revision': 'South Africa Revision',
  'sport-south-africa':       'Sport in South Africa'
};

function routeSubmission(ss, data) {
  var unit = data.unit || 'unknown';
  var tabName = TAB_NAMES[unit] || titleFromUnit(unit);

  // ----- Custom layouts (bespoke columns) -----
  if (unit === 'california-exercises') {
    var sheet = getSheet(ss, tabName, ['Timestamp','Name','Class','Ex 12','Ex 13','Ex 14','Ex 15','Ex 18','Ex 19']);
    sheet.appendRow([new Date(), data.name||'', data.cls||'',
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
    sheet.appendRow([new Date(), data.name||'', data.cls||'', exA.a||'', exA.b||'', gaps, trs, exD.para||'', exD.opinion||'']);
    return;
  }

  // ----- Universal handler: works for every other unit, no redeploy needed -----
  // Builds columns dynamically from whatever answer keys the exercise sends.
  var keys = Object.keys(data).filter(function(k){ return k!=='name' && k!=='cls' && k!=='unit'; });
  var headers = ['Timestamp','Name','Class'].concat(keys);

  var sheet = ss.getSheetByName(tabName);
  if (!sheet) {
    sheet = ss.insertSheet(tabName);
    sheet.appendRow(headers);
  } else {
    // If this exercise introduces answer keys not yet in the header row, append them.
    var existing = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
    var added = false;
    keys.forEach(function(k){
      if (existing.indexOf(k) === -1) { existing.push(k); added = true; }
    });
    if (added) sheet.getRange(1, 1, 1, existing.length).setValues([existing]);
    headers = existing;
  }

  // Map values to the (possibly extended) header order.
  var rowMap = { 'Timestamp': new Date(), 'Name': data.name||'', 'Class': data.cls||'' };
  keys.forEach(function(k){ rowMap[k] = flatten(data[k]); });
  var row = headers.map(function(h){ return (h in rowMap) ? rowMap[h] : ''; });
  sheet.appendRow(row);
}
