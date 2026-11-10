#!/usr/bin/env node
// Points Git to the versioned hooks in .githooks (run by `npm install` through `prepare`).
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));

if (existsSync(`${root}.git`)) {
  try {
    execFileSync('git', ['config', 'core.hooksPath', '.githooks'], { cwd: root, stdio: 'ignore' });
  } catch {
    // Git not available (e.g. some CI containers): hooks are optional there.
  }
}
