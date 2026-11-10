#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { run } from './index.js';

const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

process.exitCode = run(
  process.argv.slice(2),
  {
    out: line => console.log(line),
    err: line => console.error(line),
    cwd: process.cwd(),
  },
  version
);
