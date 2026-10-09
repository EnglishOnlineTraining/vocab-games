#!/bin/sh
# Usage: check-worksheet.sh worksheet.html
# Fails (exit 1) if the file breaks an eduki rule. Prints what it found.
f="$1"; bad=0
[ -f "$f" ] || { echo "usage: $0 file.html"; exit 2; }
fail() { echo "FAIL: $1"; bad=1; }
grep -qiE '<a[ >]|href=|https?://|www\.' "$f"            && fail "link or URL present"
grep -iE '[A-Za-z0-9-]+\.(training|com|de|org|net)\b' "$f" | grep -viE 'Segoe|system-ui' >/dev/null && fail "domain name present"
grep -qE '[A-Za-z0-9._-]+@[A-Za-z0-9.-]+' "$f"            && fail "email address present"
grep -qiE 'klett|green ?line|orange ?line|westermann|cornelsen' "$f" && fail "publisher or textbook name present"
grep -q 'Quellenangaben' "$f"                              || fail "Quellenangaben missing"
grep -q 'Claude.ai' "$f"                                   || fail "AI source (Claude.ai) missing in Quellenangaben"
grep -q 'Segoe UI' "$f"                                    || fail "font source missing"
grep -q 'answer-key' "$f"                                  || fail "answer key missing"
grep -q 'Name:' "$f" && grep -q 'Klasse:' "$f" && grep -q 'Datum:' "$f" || fail "student info row incomplete"
if grep -qi 'writing' "$f"; then grep -q 'Erwartungshorizont' "$f" || fail "Erwartungshorizont missing (writing task present)"; fi
grep -q 'badge' "$f"                                       || fail "no points badge"
grep -q 'CC BY-SA 4.0' "$f"                                || fail "licence line missing"
grep -q 'print-color-adjust' "$f"                          || fail "print CSS missing"
grep -q 'interaktive Online-Übung' "$f"                    || fail "online note missing"
grep -q '{{' "$f"                                          && fail "unfilled {{placeholder}}"
[ $bad -eq 0 ] && echo "OK: $f passes the eduki checks (student names are not checked: read the file for them)"
exit $bad
