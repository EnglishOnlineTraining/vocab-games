#!/usr/bin/env node
// Post-build entry for validate-data.js --built: build.js runs validators and
// checkers without arguments, and data/exercises.json is a generator's output,
// so it is checked after the build rather than before it.
process.argv.push('--built');
require('./validate-data');
