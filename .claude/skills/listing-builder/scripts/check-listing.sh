#!/bin/sh
# Usage: check-listing.sh listing.md
# Fails (exit 1) if the listing text breaks a marketplace or VOICE.md rule. Prints what it found.
f="$1"; bad=0
[ -f "$f" ] || { echo "usage: $0 listing.md"; exit 2; }
fail() { echo "FAIL: $1"; bad=1; }
grep -qiE 'https?://|www\.' "$f"                                    && fail "URL present"
grep -qiE '[A-Za-z0-9-]+\.(training|com|de|org|net)\b' "$f"         && fail "domain or site name present"
grep -qE '[A-Za-z0-9._-]+@[A-Za-z0-9.-]+' "$f"                      && fail "email address present"
grep -qiE 'klett|green ?line|orange ?line|westermann|cornelsen' "$f" && fail "publisher or textbook name present"
grep -qiE '\b(viral|unlock|game-?changer|revolution[a-z]*|secret|hack|ultimate|effortless)\b' "$f" && fail "hype word present (VOICE.md section 8)"
grep -qiE 'fluent in|guarantee|garantiert' "$f"                     && fail "promise of results present (VOICE.md section 8)"
grep -q '!' "$f"                                                    && fail "exclamation mark present (VOICE.md section 5)"
grep -q '{{' "$f"                                                   && fail "unfilled {{placeholder}}"
for field in 'Titel' 'Beschreibung' 'Tags' 'KI-Tools'; do
  grep -q "$field" "$f" || fail "field missing: $field"
done
[ $bad -eq 0 ] && echo "OK: $f passes the listing checks (student names are not checked: read the text for them)"
exit $bad
