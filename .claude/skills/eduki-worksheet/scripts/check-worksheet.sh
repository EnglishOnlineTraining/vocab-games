#!/bin/sh
# Usage: check-worksheet.sh worksheet.html [--bw]
# Fails (exit 1) if the file breaks an eduki rule; with --bw, also if it is not black and white. Prints what it found.
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
grep -q 'class="goals"' "$f"                               || fail "learning goals (I can) box missing"
grep -q 'class="help"' "$f"                                || fail "support aid (Need help? / sentence starters) missing"
grep -q 'class="bonus"' "$f"                               || fail "bonus task for fast finishers missing"
grep -q 'class="pair"' "$f"                                || fail "partner or peer-feedback phase missing"
grep -q 'Hinweise für Lehrkräfte' "$f"                     || fail "teacher notes page missing"
grep -q 'Reflexion' "$f"                                   || fail "teacher reflection questions missing"
grep -q 'Lehrplan' "$f"                                    || fail "curriculum reference missing in teacher notes"
grep -qE '<svg|class="visual"' "$f"                       || fail "visual artifact (inline SVG figure) missing"
grep -q 'class="selfcheck"' "$f"                            || fail "Check yourself (self-assessment) missing"
grep -q 'Einsatzmöglichkeiten' "$f"                      || fail "teaching contexts missing in teacher notes"
grep -q 'class="group"' "$f"                               || fail "group task with a shared product missing"
grep -q 'Verlaufsplan' "$f"                                || fail "Verlaufsplan (phases table) missing in teacher notes"
grep -q 'badge' "$f"                                       || fail "no points badge"
grep -q 'CC BY-SA 4.0' "$f"                                || fail "licence line missing"
if [ "$2" = --bw ]; then  # printable = black and white, only when Shaun asks for printable (CLAUDE.md rule 10)
  grep -q '@media print' "$f"                             || fail "print CSS missing"
  grep -q 'print-color-adjust' "$f"                        && fail "print-color-adjust forces colour printing (--bw)"
  c=$(grep -oE '#[0-9a-fA-F]{3,6}\b|rgba?\(' "$f" | grep -viE '^#(000|000000|fff|ffffff)$' | sort -u | tr '\n' ' ')
  [ -n "$c" ] && fail "colour present (--bw): $c"
else
  grep -q 'print-color-adjust' "$f"                        || fail "print CSS missing"
fi
grep -q 'interaktive Online-Übung' "$f"                    || fail "online note missing"
grep -q '{{' "$f"                                          && fail "unfilled {{placeholder}}"
[ $bad -eq 0 ] && echo "OK: $f passes the eduki checks (student names are not checked: read the file for them)"
exit $bad
