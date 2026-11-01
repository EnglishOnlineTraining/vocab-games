/*
 * spelling.js — eolSpellingClose(given, key): is `given` the word `key` with a
 * small spelling slip? Shared by exam.js (timed tests, examSpellingOk) and
 * vocab-srs.js (the practice typing round). Both call it only when the student
 * has the dyslexia option on. build-head.js adds this file to every page that
 * loads exam.js or vocab-srs.js.
 *
 * One slip in a word of 4–6 letters, two in a longer one (a swapped pair counts
 * as one), none in a word under 4 letters.
 * ponytail: edit distance is a heuristic. It can pass a different real word that
 * is close in spelling (dessert / desert). Tests tell the teacher (dyslexia=yes);
 * in practice the student sees the right spelling.
 */
function eolSpellingClose(given, key) {
  var a = String(given || ''), b = String(key || '');
  var max = b.length < 4 ? 0 : b.length <= 6 ? 1 : 2;
  if (!a || Math.abs(a.length - b.length) > max) return false;
  var d = [], i, j;
  for (i = 0; i <= a.length; i++) { d[i] = [i]; }
  for (j = 0; j <= b.length; j++) { d[0][j] = j; }
  for (i = 1; i <= a.length; i++) {
    for (j = 1; j <= b.length; j++) {
      var cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[a.length][b.length] <= max;
}
