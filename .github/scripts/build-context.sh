#!/usr/bin/env bash
# build-context.sh -- assembles the shared context bundle for model calls.
# Vocab-games variant: stable context is STYLE.md (the canonical AI contract),
# the learning-design checks, and the page template; variable context is the
# set of files relevant to the current task.
#
# Usage:
#   ./build-context.sh                          repo-wide context only
#   ./build-context.sh --files changed.txt      reads file paths from changed.txt
#   ./build-context.sh foo.html bar.php         (legacy) file paths as arguments
#
# Output goes to $CONTEXT_OUT (default: context.md). The script writes the file
# directly -- do NOT redirect stdout to the same path or the output will be
# corrupted (the final status echo would overwrite the first bytes).
set -euo pipefail

OUT="${CONTEXT_OUT:-context.md}"
MAX_FILE_LINES=800
FILES=()

# Parse arguments: --files <path> reads from a file; bare args are file paths.
while [ $# -gt 0 ]; do
  case "$1" in
    --files)
      shift
      if [ -f "$1" ]; then
        while IFS= read -r line; do
          [ -n "$line" ] && FILES+=("$line")
        done < "$1"
      fi
      shift
      ;;
    *)
      FILES+=("$1")
      shift
      ;;
  esac
done

{
  echo "# CONTEXT PACK for AI tasks"
  echo "Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo

  # -- Stable context (rarely changes, cacheable) --

  echo "## STYLE.md (canonical contract -- follow exactly)"
  if [ -f STYLE.md ]; then
    cat STYLE.md
  else
    echo "ERROR: STYLE.md is missing. The models need this file to produce correct code."
    echo "Add STYLE.md to the repo root before running AI workflows."
  fi
  echo

  echo "## Learning-design checks (nine shared requirements)"
  if [ -f docs/learning-design-checks.md ]; then
    cat docs/learning-design-checks.md
  else
    echo "(no docs/learning-design-checks.md found)"
  fi
  echo

  echo "## Page template (_template.html -- the structure every exercise page follows)"
  if [ -f _template.html ]; then
    LINES=$(wc -l < _template.html)
    if [ "$LINES" -gt "$MAX_FILE_LINES" ]; then
      echo "(truncated: showing first $MAX_FILE_LINES of $LINES lines)"
    fi
    head -n "$MAX_FILE_LINES" _template.html
  else
    echo "(no _template.html found)"
  fi
  echo

  echo "## Repo map (HTML/JS/CSS files, first 200)"
  find . -type f \( -name '*.html' -o -name '*.js' -o -name '*.css' \) \
    -not -path './node_modules/*' | sort | head -200
  echo

  # -- Variable context (changes per task) --

  if [ ${#FILES[@]} -gt 0 ]; then
    echo "## Task-relevant files (full contents, capped at $MAX_FILE_LINES lines each)"
    for f in "${FILES[@]}"; do
      if [ -f "$f" ]; then
        echo
        echo "### FILE: $f"
        LINES=$(wc -l < "$f")
        if [ "$LINES" -gt "$MAX_FILE_LINES" ]; then
          echo "(truncated: showing first $MAX_FILE_LINES of $LINES lines)"
        fi
        echo '```'
        head -n "$MAX_FILE_LINES" "$f"
        echo '```'
      fi
    done
  fi
} > "$OUT"

echo "Wrote $OUT ($(wc -l < "$OUT") lines)" >&2
