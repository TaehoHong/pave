#!/usr/bin/env node
'use strict';

const { run } = require('./init_repo.js');

process.exitCode = run(process.argv.slice(2));
