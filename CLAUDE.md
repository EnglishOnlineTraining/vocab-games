# docemus · EnglishOnline.training — Project Guide

## What this project is
Static HTML exercise pages for English language learners, hosted on GitHub Pages and linked from a WordPress site. No build system — every file is a standalone HTML page.

**Live URL:** `https://activities.englishonline.training/`  
**GitHub Pages fallback:** `https://englishonlinetraining.github.io/vocab-games/`  
**Custom domain:** `activities.englishonline.training` (DNS CNAME → `englishonlinetraining.github.io`)  
**WordPress site:** `englishonline.training` (blog ID `65893384`, Simple plan — no SFTP)  
**GitHub repo:** `https://github.com/EnglishOnlineTraining/vocab-games`  
**Teacher email:** `shaun.trezise@docemus.de`

---

## File structure

| File | Year | School | Notes |
|------|------|--------|-------|
| `activities.html` | — | — | Central hub — links to all exercises |
| `vocab-games.html` / `index.html` | 7 | Gymnasium | Vocabulary games (matching, FIB, MC, scramble) |
| `7c-holidays.html` | 7 | Oberschule | Holidays vocabulary & comprehension |
| `7c-robert-the-bruce.html` | 7 | Oberschule | Comic strip reading & writing |
| `7g-tudor-past-perfect.html` | 7 | Gymnasium | Past perfect grammar & Tudor reading |
| `california-exercises.html` | 9 | Gymnasium | Economy, articles, abstract/collective nouns |
| `9g-california-hazards.html` | 9 | Gymnasium | Wildfires, modal verbs, cause & effect |
| `9c-south-africa-revision.html` | 9 | Oberschule | South Africa revision |
| `sport-south-africa.html` | 9 | Oberschule | Sport in South Africa reading |
| `_template.html` | — | — | **Start here for every new exercise** |

---

## Google Sheets submission

All exercises submit answers via `fetch()` with `mode: 'no-cors'` to a Google Apps Script web app. Each exercise has a `unit` identifier that routes the data to a separate tab within the sheet.

### Year 7 Sheet URL
```
https://script.google.com/macros/s/AKfycbyFmK71PseRmH8gBnuD3HLFU9b75eMPhE-LV8hNKSGM2RJ4bbMTIMrcoi3Qo4WG95qxIw/exec
```
Used by: `7c-holidays.html`, `7c-robert-the-bruce.html`, `7g-tudor-past-perfect.html`

### Year 9 Sheet URL
```
https://script.google.com/macros/s/AKfycbw2eqOCB6XKREIOXuqn2fCL067CdMm20MmiTFMt9GmRUEn12vLl8gJbHL1UfbKmCP7W/exec
```
Used by: `california-exercises.html`, `9g-california-hazards.html`, `9c-south-africa-revision.html`, `sport-south-africa.html`

### Unit identifiers → Sheet tabs

| unit value | Sheet tab |
|------------|-----------|
| `california-exercises` | California Exercises |
| `california-hazards` | California Hazards |
| `robert-the-bruce-7c` | Robert the Bruce |
| `tudor-past-perfect` | Tudor Past Perfect |
| `9c-south-africa-revision` | South Africa Revision |
| `sport-south-africa` | Sport in South Africa |

When adding a new exercise, add a new entry to the Apps Script and redeploy as a new version (same URL).

---

## Standard features — every exercise must have these

### 1. Sticky header with back-link
```html
<header class="app-header">
  <div class="header-inner">
    <a class="header-logo" href="https://englishonline.training">englishonline.training</a>
    <a class="header-logo" href="activities.html" style="font-size:.75rem;opacity:.8">← Activities</a>
    ...
  </div>
  <div class="progress-track"><div class="progress-fill" id="progress-fill"></div></div>
</header>
```

### 2. Paste-block (inputs and textareas only)
```javascript
document.addEventListener('paste', function(e) {
  var t = e.target;
  if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') {
    e.preventDefault();
    var msg = document.createElement('div');
    msg.textContent = '✏️ Pasting is not allowed';
    msg.style.cssText = 'position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);background:#1a3a5c;color:#fff;padding:.55rem 1.2rem;border-radius:8px;font-size:.85rem;font-family:inherit;z-index:9999;pointer-events:none;opacity:1;transition:opacity .4s';
    document.body.appendChild(msg);
    setTimeout(function() { msg.style.opacity='0'; setTimeout(function(){ msg.remove(); },400); },2000);
  }
});
```

### 3. Copy-block (entire page)
```javascript
document.addEventListener('copy', function(e) {
  e.preventDefault();
  var msg = document.createElement('div');
  msg.textContent = '🚫 Copying is not allowed';
  msg.style.cssText = 'position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);background:#1a3a5c;color:#fff;padding:.55rem 1.2rem;border-radius:8px;font-size:.85rem;font-family:inherit;z-index:9999;pointer-events:none;opacity:1;transition:opacity .4s';
  document.body.appendChild(msg);
  setTimeout(function() { msg.style.opacity='0'; setTimeout(function(){ msg.remove(); },400); },2000);
});
```

Both blocks go in a separate `<script>` tag just before `</body>`. They are already pre-built in `_template.html`.

---

## Adding a new exercise — checklist

1. **Copy `_template.html`** and rename it (e.g. `9g-new-topic.html`)
2. **Fill in every `TODO`** comment in the file
3. **Set `UNIT`** to a unique kebab-case string (e.g. `'9g-new-topic'`)
4. **Set `SHEET_URL`** to the correct year's URL (see above)
5. **Update the Apps Script** for that year's sheet — add an `else if` for the new unit and a write function, then redeploy as a new version
6. **Add a card in `activities.html`** under the correct year/school section
7. **Commit and push to `main`** — GitHub Pages deploys automatically

---

## Deployment

- GitHub Pages serves from the **`main`** branch
- Push directly to `main` for live changes
- Branch structure: `main` → `docemus` → `year-7`, `year-9` (feature branches, merge to main when ready)
- WordPress Activities page (ID `1763`) links to GitHub Pages URLs — update it via WordPress MCP when adding new exercises

---

## CSS design tokens (shared across all pages)

```css
--blue:    #1a3a5c;
--gold:    #c9a227;
--gold-lt: #f5e6b0;
--teal:    #2b7a78;
--red:     #c0392b;
--green:   #27ae60;
--bg:      #f7f9fc;
--card:    #ffffff;
--text:    #1d2b3a;
--muted:   #6b7a8d;
--border:  #dce3ec;
--radius:  12px;
--shadow:  0 2px 16px rgba(26,58,92,.1);
--font:    'Segoe UI', system-ui, sans-serif;
```

---

## Apps Script — full current version

Paste this into **both** year scripts (Year 7 sheet and Year 9 sheet) and redeploy as a new version each time the unit list changes:

```javascript
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

function routeSubmission(ss, data) {
  var unit = data.unit || 'unknown';
  var tabName;

  if      (unit === 'california-exercises')      { tabName = 'California Exercises'; }
  else if (unit === 'california-hazards')        { tabName = 'California Hazards'; }
  else if (unit === 'robert-the-bruce-7c')       { tabName = 'Robert the Bruce'; }
  else if (unit === 'tudor-past-perfect')        { tabName = 'Tudor Past Perfect'; }
  else if (unit === '9c-south-africa-revision')  { tabName = 'South Africa Revision'; }
  else if (unit === 'sport-south-africa')        { tabName = 'Sport in South Africa'; }
  else                                           { tabName = 'Other – ' + unit; }

  if (unit === 'california-exercises') {
    var sheet = getSheet(ss, tabName, ['Timestamp','Name','Class','Ex 12','Ex 13','Ex 14','Ex 15','Ex 18','Ex 19']);
    sheet.appendRow([new Date(), data.name||'', data.cls||'',
      JSON.stringify(data.ex12||''), JSON.stringify(data.ex13||''),
      JSON.stringify(data.ex14||''), JSON.stringify(data.ex15||''),
      JSON.stringify(data.ex18||''), JSON.stringify(data.ex19||'')]);
  } else if (unit === 'california-hazards') {
    var exA=data.exA||{}, exB=data.exB||{}, exC=data.exC||{}, exD=data.exD||{};
    var gaps=[1,2,3,4,5,6,7,8].map(function(i){return 'Gap '+i+': '+(exB['g'+i]||'(blank)');}).join('\n');
    var trs=[1,2,3,4,5,6].map(function(i){return i+'. '+(exC['t'+i]||'(blank)');}).join('\n');
    var sheet = getSheet(ss, tabName, ['Timestamp','Name','Class','Ex A – Problems','Ex A – Connection','Ex B – Modal gaps','Ex C – Transforms','Ex D – Paragraph','Ex D – Opinion']);
    sheet.appendRow([new Date(), data.name||'', data.cls||'', exA.a||'', exA.b||'', gaps, trs, exD.para||'', exD.opinion||'']);
  } else {
    var keys = Object.keys(data).filter(function(k){ return k!=='name'&&k!=='cls'&&k!=='unit'; });
    var headers = ['Timestamp','Name','Class'].concat(keys);
    var sheet = getSheet(ss, tabName, headers);
    var row = [new Date(), data.name||'', data.cls||''];
    keys.forEach(function(k){ row.push(flatten(data[k])); });
    sheet.appendRow(row);
  }
}
```
