/*
 * minipdf.js — a very small PDF writer, enough for a feedback sheet.
 *
 * Why hand-written rather than jsPDF: the artifact CSP admits scripts from
 * cdnjs, but a CDN script that 404s in the viewer fails SILENTLY — a dead
 * button, no error — and the build container cannot reach cdnjs to pin a
 * version that exists. This has no network dependency and is verifiable here.
 *
 * Scope on purpose: PDF 1.4, the two built-in Helvetica faces, WinAnsiEncoding,
 * left-aligned text, horizontal rules and filled boxes. No images, no unicode
 * beyond Latin-1, no compression. That is the whole document a feedback sheet
 * needs to draw.
 *
 * Runs unchanged in Node and the browser: it builds a Uint8Array.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.MiniPDF = factory();
}(typeof self !== 'undefined' ? self : this, function () {
'use strict';

// Adobe's Helvetica widths, 1000 units to the em. Bold is approximated from
// these (see widthOf) — the only consequence is that a bold line wraps a touch
// earlier than it strictly needs to.
var W = {};
(function () {
  var s = '32:278 33:278 34:355 35:556 36:556 37:889 38:667 39:191 40:333 41:333 42:389 43:584 '
    + '44:278 45:333 46:278 47:278 58:278 59:278 60:584 61:584 62:584 63:556 64:1015 '
    + '65:667 66:667 67:722 68:722 69:667 70:611 71:778 72:722 73:278 74:500 75:667 76:556 77:833 '
    + '78:722 79:778 80:667 81:778 82:722 83:667 84:611 85:722 86:667 87:944 88:667 89:667 90:611 '
    + '91:278 92:278 93:278 94:469 95:556 96:333 '
    + '97:556 98:556 99:500 100:556 101:556 102:278 103:556 104:556 105:222 106:222 107:500 108:222 '
    + '109:833 110:556 111:556 112:556 113:556 114:333 115:500 116:278 117:556 118:500 119:722 '
    + '120:500 121:500 122:500 123:334 124:260 125:334 126:584';
  s.split(' ').forEach(function (p) { var kv = p.split(':'); W[+kv[0]] = +kv[1]; });
  for (var d = 48; d <= 57; d++) W[d] = 556;            // digits are all 556
})();

// WinAnsi codes this kind of document actually produces: German letters, the
// dashes and quotes the pages write, the middle dot. Each borrows the width of
// the base letter it is built from.
var EXTRA = { 0xE4:'a',0xF6:'o',0xFC:'u',0xC4:'A',0xD6:'O',0xDC:'U',0xDF:'B',0xE9:'e',0xE8:'e',
  0xE0:'a',0xE1:'a',0xED:'i',0xF3:'o',0xFA:'u',0xF1:'n',0xE7:'c',
  0x91:"'",0x92:"'",0x93:'"',0x94:'"',0x96:'-',0x97:'-',0xB7:'.',0xA0:' ',0x85:'.' };

function codeOf(ch) {
  var c = ch.charCodeAt(0);
  if (c < 128) return c;
  // The typographic characters Unicode puts outside Latin-1.
  var map = { 0x2018:0x91, 0x2019:0x92, 0x201C:0x93, 0x201D:0x94, 0x2013:0x96,
              0x2014:0x97, 0x2026:0x85, 0x00B7:0xB7, 0x2192:0x3E /* → as > */ };
  if (map[c] != null) return map[c];
  if (c <= 0xFF) return c;
  return 0x3F; // '?' — nothing else survives WinAnsi
}

function widthOf(text, size, bold) {
  var t = 0;
  for (var i = 0; i < text.length; i++) {
    var c = codeOf(text[i]);
    var w = W[c];
    if (w == null) { var base = EXTRA[c]; w = base ? W[base.charCodeAt(0)] : 500; }
    t += w == null ? 500 : w;
  }
  return t / 1000 * size * (bold ? 1.06 : 1);
}

function esc(text) {
  var out = '';
  for (var i = 0; i < text.length; i++) {
    var c = codeOf(text[i]);
    if (c === 40 || c === 41 || c === 92) out += '\\' + String.fromCharCode(c);
    else if (c < 32) out += ' ';
    else out += String.fromCharCode(c);
  }
  return out;
}

/* ───────────────────────── the document ───────────────────────── */

function Doc(opts) {
  opts = opts || {};
  this.w = opts.width || 595.28;      // A4 portrait, points
  this.h = opts.height || 841.89;
  this.margin = opts.margin || 48;
  this.pages = [];
  this.newPage();
}

Doc.prototype.newPage = function () {
  this.ops = [];
  this.pages.push(this.ops);
  this.y = this.h - this.margin;
  return this;
};

Doc.prototype.room = function (need) { return this.y - need >= this.margin; };

Doc.prototype.text = function (s, opts) {
  opts = opts || {};
  var size = opts.size || 10, bold = !!opts.bold;
  var x = opts.x != null ? opts.x : this.margin;
  var colour = opts.colour || [0.09, 0.13, 0.18];
  var maxW = opts.width != null ? opts.width : (this.w - this.margin - x);
  var lines = this.wrap(String(s == null ? '' : s), maxW, size, bold);
  var lead = opts.lead || size * 1.32;
  for (var i = 0; i < lines.length; i++) {
    if (!this.room(lead)) this.newPage();
    this.y -= lead;
    this.ops.push('BT /' + (bold ? 'FB' : 'FR') + ' ' + size + ' Tf '
      + colour.map(function (n) { return n.toFixed(3); }).join(' ') + ' rg '
      + x.toFixed(2) + ' ' + this.y.toFixed(2) + ' Td (' + esc(lines[i]) + ') Tj ET');
  }
  return this;
};

// Greedy wrap on spaces; a single word longer than the column is cut rather
// than allowed to run off the page edge.
Doc.prototype.wrap = function (s, maxW, size, bold) {
  var words = String(s).split(/\s+/).filter(function (w) { return w !== ''; });
  if (!words.length) return [''];
  var lines = [], line = '';
  for (var i = 0; i < words.length; i++) {
    var trial = line ? line + ' ' + words[i] : words[i];
    if (widthOf(trial, size, bold) <= maxW) { line = trial; continue; }
    if (line) { lines.push(line); line = ''; }
    var w = words[i];
    while (widthOf(w, size, bold) > maxW && w.length > 1) {
      var cut = w.length;
      while (cut > 1 && widthOf(w.slice(0, cut), size, bold) > maxW) cut--;
      lines.push(w.slice(0, cut));
      w = w.slice(cut);
    }
    line = w;
  }
  if (line) lines.push(line);
  return lines;
};

Doc.prototype.gap = function (n) { this.y -= (n == null ? 8 : n); return this; };

Doc.prototype.rule = function (colour) {
  if (!this.room(6)) this.newPage();
  this.y -= 4;
  var c = colour || [0.86, 0.89, 0.93];
  this.ops.push(c.map(function (n) { return n.toFixed(3); }).join(' ') + ' RG 0.7 w '
    + this.margin + ' ' + this.y.toFixed(2) + ' m ' + (this.w - this.margin) + ' ' + this.y.toFixed(2) + ' l S');
  this.y -= 2;
  return this;
};

Doc.prototype.box = function (x, yTop, w, h, fill, stroke) {
  var ops = [];
  if (fill) ops.push(fill.map(function (n) { return n.toFixed(3); }).join(' ') + ' rg '
    + x.toFixed(2) + ' ' + (yTop - h).toFixed(2) + ' ' + w.toFixed(2) + ' ' + h.toFixed(2) + ' re f');
  if (stroke) ops.push(stroke.map(function (n) { return n.toFixed(3); }).join(' ') + ' RG 1 w '
    + x.toFixed(2) + ' ' + (yTop - h).toFixed(2) + ' ' + w.toFixed(2) + ' ' + h.toFixed(2) + ' re S');
  this.ops.push(ops.join(' '));
  return this;
};

/*
 * A table with fixed column widths. Each cell wraps inside its column, the row
 * is as tall as its tallest cell, and a row that will not fit starts a new page
 * with the header repeated — otherwise a long class breaks mid-row.
 */
Doc.prototype.table = function (cols, rows, opts) {
  opts = opts || {};
  var size = opts.size || 8.5, pad = 3, self = this;
  var total = cols.reduce(function (a, c) { return a + c.w; }, 0);
  var scale = (this.w - 2 * this.margin) / total;
  var xs = [], x = this.margin;
  cols.forEach(function (c) { xs.push(x); x += c.w * scale; });

  function rowHeight(cells) {
    var max = 0;
    cells.forEach(function (cell, i) {
      var lines = self.wrap(String(cell == null ? '' : cell), cols[i].w * scale - 2 * pad, size, false);
      max = Math.max(max, lines.length * size * 1.3);
    });
    return max + 2 * pad;
  }

  function header() {
    var h = rowHeight(cols.map(function (c) { return c.t; }));
    if (!self.room(h + 4)) self.newPage();
    self.box(self.margin, self.y, self.w - 2 * self.margin, h, [0.93, 0.95, 0.97], null);
    cols.forEach(function (c, i) {
      self.cell(c.t, xs[i] + pad, self.y - pad, c.w * scale - 2 * pad, size, true, [0.36, 0.44, 0.52], c.align);
    });
    self.y -= h;
  }

  header();
  rows.forEach(function (cells, ri) {
    var h = rowHeight(cells);
    if (!self.room(h + 2)) { self.newPage(); header(); }
    cols.forEach(function (c, i) {
      // The row index is passed too: the caller holds the marking metadata for
      // each row and the cell text alone cannot say what colour it should be.
      var colour = (opts.colourOf && opts.colourOf(cells, i, ri)) || [0.09, 0.13, 0.18];
      self.cell(cells[i], xs[i] + pad, self.y - pad, c.w * scale - 2 * pad, size, false, colour, c.align);
    });
    self.y -= h;
    self.ops.push('0.93 0.95 0.97 RG 0.5 w ' + self.margin + ' ' + self.y.toFixed(2)
      + ' m ' + (self.w - self.margin) + ' ' + self.y.toFixed(2) + ' l S');
  });
  return this;
};

// One table cell: wrapped, drawn from a fixed top edge so it cannot push the
// page cursor around mid-row.
Doc.prototype.cell = function (s, x, yTop, w, size, bold, colour, align) {
  var lines = this.wrap(String(s == null ? '' : s), w, size, bold);
  for (var i = 0; i < lines.length; i++) {
    var lx = x;
    if (align === 'r') lx = x + w - widthOf(lines[i], size, bold);
    this.ops.push('BT /' + (bold ? 'FB' : 'FR') + ' ' + size + ' Tf '
      + colour.map(function (n) { return n.toFixed(3); }).join(' ') + ' rg '
      + lx.toFixed(2) + ' ' + (yTop - size - i * size * 1.3).toFixed(2) + ' Td (' + esc(lines[i]) + ') Tj ET');
  }
};

/* ───────────────────────── serialising ───────────────────────── */

Doc.prototype.build = function () {
  var objs = [], self = this;
  function add(body) { objs.push(body); return objs.length; }   // 1-based object numbers

  var fontR = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  var fontB = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
  var pagesNum = add(null);                                     // filled in below

  var kids = [];
  this.pages.forEach(function (ops) {
    var stream = ops.join('\n');
    var contentNum = add('<< /Length ' + stream.length + ' >>\nstream\n' + stream + '\nendstream');
    var pageNum = add('<< /Type /Page /Parent ' + pagesNum + ' 0 R /MediaBox [0 0 '
      + self.w.toFixed(2) + ' ' + self.h.toFixed(2) + '] /Resources << /Font << /FR ' + fontR
      + ' 0 R /FB ' + fontB + ' 0 R >> >> /Contents ' + contentNum + ' 0 R >>');
    kids.push(pageNum);
  });
  objs[pagesNum - 1] = '<< /Type /Pages /Count ' + kids.length + ' /Kids ['
    + kids.map(function (n) { return n + ' 0 R'; }).join(' ') + '] >>';
  var catalog = add('<< /Type /Catalog /Pages ' + pagesNum + ' 0 R >>');

  var out = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
  var offsets = [];
  objs.forEach(function (body, i) {
    offsets.push(out.length);
    out += (i + 1) + ' 0 obj\n' + body + '\nendobj\n';
  });
  var xref = out.length;
  out += 'xref\n0 ' + (objs.length + 1) + '\n0000000000 65535 f \n';
  offsets.forEach(function (o) { out += String(o).padStart(10, '0') + ' 00000 n \n'; });
  out += 'trailer\n<< /Size ' + (objs.length + 1) + ' /Root ' + catalog + ' 0 R >>\n'
    + 'startxref\n' + xref + '\n%%EOF';

  // Latin-1 out: every byte written above is already a single code unit.
  var bytes = new Uint8Array(out.length);
  for (var i = 0; i < out.length; i++) bytes[i] = out.charCodeAt(i) & 0xFF;
  return bytes;
};

return { Doc: Doc, widthOf: widthOf };
}));
