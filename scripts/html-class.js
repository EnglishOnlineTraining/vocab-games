'use strict';
// Shared by the generators: the regex source for `class="…"` that holds token `cls`,
// wherever it sits in the class list ("ex-title", "ex-title big", "big ex-title").
// ponytail: double-quoted attributes only (the repo's HTML never single-quotes class);
// a '>' inside another attribute's value still ends the tag early. Upgrade path: a parser.
const classAttr = (cls) => 'class="(?:[^"]*\\s)?' + cls + '(?:\\s[^"]*)?"';
module.exports = { classAttr };

if (require.main === module) {            // self-check: node scripts/html-class.js
  const assert = require('assert');
  const re = new RegExp('<h2\\b[^>]*' + classAttr('ex-title') + '[^>]*>', 'i');
  ['<h2 class="ex-title">', '<h2 class="ex-title big">', '<h2 id="a" class="big ex-title" lang="en">'].forEach((s) => assert(re.test(s), s));
  ['<h2 class="ex-titles">', '<h2 class="my-ex-title">', '<h2 data-x="ex-title">'].forEach((s) => assert(!re.test(s), s));
  console.log('html-class ok');
}
