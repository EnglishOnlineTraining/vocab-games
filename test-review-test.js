#!/usr/bin/env node
'use strict';

/*
 * test-review-test.js — self-check for scripts/review-test.js.
 *
 * Runs as a build checker (see CHECKERS in scripts/pipeline.js), so a change to
 * how a test page stores its answer key, or to the error classifier, fails the
 * build instead of quietly re-marking a class differently.
 *
 * The fixtures are error patterns a real class produced, but no student name or
 * answer text is stored here — only (given, expected) pairs.
 */

require('./scripts/review-test.js').selfTest(process.argv.indexOf('--verbose') !== -1);
