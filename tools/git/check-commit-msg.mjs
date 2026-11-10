#!/usr/bin/env node
// Validates a commit message against Conventional Commits (commit-msg hook).
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const types = [
  'feat',
  'fix',
  'docs',
  'style',
  'refactor',
  'perf',
  'test',
  'build',
  'ci',
  'chore',
  'revert',
];

const header = new RegExp(`^(${types.join('|')})(\\([a-z0-9-]+(,[a-z0-9-]+)*\\))?!?: \\S.{0,98}$`);

export function checkMessage(message) {
  const first = message.split('\n').find(line => line.trim() && !line.startsWith('#')) ?? '';
  if (/^(Merge|Revert) /.test(first)) return true;
  return header.test(first);
}

function main() {
  const file = process.argv[2];
  if (!file) return;
  const message = readFileSync(file, 'utf8');
  if (!checkMessage(message)) {
    console.error('Commit message must follow Conventional Commits, e.g.:');
    console.error('  feat(elements): add cosm-switch');
    console.error(`  Allowed types: ${types.join(', ')}`);
    process.exit(1);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
