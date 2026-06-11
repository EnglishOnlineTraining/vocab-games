#!/usr/bin/env python3
"""
Patch englishonline.training task pages so they send flat, readable answer
strings (ex1..exN) to the Make webhook instead of nested objects.

Usage:  python3 patch_year7_tasks.py            (run in the vocab-games repo root)
        python3 patch_year7_tasks.py --dry-run  (show what would change)

Idempotent: pages already patched are skipped.
"""
import re, sys, glob

WEBHOOK_MARKER = "hook.eu1.make.com"
PATCH_MARKER   = "/* eol-flat-payload-patch */"

FLAT_HELPER = """
/* eol-flat-payload-patch */
function eolFlat(o) {
  if (o == null) return '';
  if (typeof o !== 'object') return String(o);
  return Object.keys(o).map(function(k) {
    return k + ': ' + (o[k] === '' || o[k] == null ? '\\u2014' : o[k]);
  }).join(' | ');
}
"""

PAYLOAD_RE = re.compile(r"var\s+payload\s*=\s*\{(.*?)\};", re.S)
ENTRY_RE   = re.compile(r"([A-Za-z_$][\w$]*)\s*:\s*([^,]+?)\s*(?:,|$)", re.S)

def transform_payload(body):
    keep, groups, unknown = [], {}, []
    for key, expr in ENTRY_RE.findall(body):
        expr = expr.strip()
        if key in ("name", "cls", "unit"):
            keep.append((key, expr))
            continue
        m = re.fullmatch(r"ex([A-Z])", key)          # exA, exB ...
        if m:
            n = ord(m.group(1)) - 64
            groups.setdefault(n, {})[""] = expr
            continue
        m = re.fullmatch(r"ex(\d+)([ab]?)", key)      # ex2, ex3a, ex3b ...
        if m:
            n = int(m.group(1))
            groups.setdefault(n, {})[m.group(2)] = expr
            continue
        unknown.append((key, expr))                   # e.g. answers
    lines = ["  %s: %s" % (k, v) for k, v in keep]
    for n in sorted(groups):
        parts = groups[n]
        exprs = [parts[s] for s in ("", "a", "b") if s in parts]
        joined = " + '  //  ' + ".join("eolFlat(%s)" % e for e in exprs)
        lines.append("  ex%d: %s" % (n, joined))
    for k, v in unknown:
        lines.append("  %s: eolFlat(%s)" % (k, v))
    return "var payload = {\n" + ",\n".join(lines) + "\n};", unknown

def patch_file(path, dry):
    src = open(path, encoding="utf-8").read()
    if WEBHOOK_MARKER not in src:
        return "skip (not a Make-webhook page)"
    if PATCH_MARKER in src:
        return "skip (already patched)"
    m = PAYLOAD_RE.search(src)
    if not m:
        return "WARNING: no payload object found - patch manually"
    new_payload, unknown = transform_payload(m.group(1))
    out = src[:m.start()] + new_payload + src[m.end():]
    # insert helper just before submitToSheet definition
    fn = out.find("function submitToSheet")
    if fn == -1:
        return "WARNING: no submitToSheet() found - patch manually"
    out = out[:fn] + FLAT_HELPER + "\n" + out[fn:]
    note = " (note: key(s) %s wrapped as-is)" % ",".join(k for k, _ in unknown) if unknown else ""
    if not dry:
        open(path, "w", encoding="utf-8").write(out)
    return ("patched" if not dry else "would patch") + note

def main():
    dry = "--dry-run" in sys.argv
    files = sorted(glob.glob("7*.html")) + sorted(glob.glob("assets/_template.html"))
    if not files:
        print("No 7*.html files here - run this in the vocab-games repo root.")
        sys.exit(1)
    for f in files:
        print("%-40s %s" % (f, patch_file(f, dry)))

if __name__ == "__main__":
    main()
