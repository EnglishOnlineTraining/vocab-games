#!/usr/bin/env bash
# build-context.sh -- assembles the shared context bundle for model calls.
#
# Usage:
#   ./build-context.sh                          repo-wide context only
#   ./build-context.sh --files changed.txt      reads file paths from changed.txt
#   ./build-context.sh foo.php bar.php           (legacy) file paths as arguments
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

  echo "## Dependency manifests"
  for f in composer.json package.json; do
    if [ -f "$f" ]; then
      echo "### $f"
      cat "$f"
      echo
    fi
  done

  echo "## PHPCS ruleset"
  if [ -f phpcs.xml ]; then
    cat phpcs.xml
  else
    echo "(no phpcs.xml found)"
  fi
  echo

  echo "## Repo map (structure)"
  find . -type f \( -name '*.php' -o -name '*.js' -o -name '*.css' -o -name '*.scss' \) \
    -not -path './vendor/*' -not -path './node_modules/*' | sort | head -200
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
