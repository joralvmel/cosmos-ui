#!/usr/bin/env node
// Commit identity checks. The repository contains no identity list: every collaborator commits with
// their own identity.
//
//   node tools/git/check-identity.mjs               pre-commit: if `.local/git-identity.json` exists
//                                                   (ignored by Git), the Git identity must match it
//   node tools/git/check-identity.mjs --range A..B  CI: author/committer emails of the range must not
//                                                   contain blocked terms (bots are ignored)
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compile, loadTerms } from '../check-terms.mjs';

const IDENTITY_FILE = join('.local', 'git-identity.json');

/** Reads the optional personal identity file. Returns `undefined` when it does not exist. */
export function loadIdentity(root = process.cwd()) {
  const path = join(root, IDENTITY_FILE);
  if (!existsSync(path)) return undefined;
  const data = JSON.parse(readFileSync(path, 'utf8'));
  for (const key of ['name', 'email']) {
    if (typeof data[key] !== 'string' || !data[key].trim()) {
      throw new Error(`${IDENTITY_FILE}: "${key}" must be a non-empty string`);
    }
  }
  return {
    name: data.name,
    email: data.email,
    githubLogin: typeof data.githubLogin === 'string' ? data.githubLogin : undefined,
  };
}

/** Compares the current Git identity with the expected one. No expectation means no check. */
export function checkIdentity(current, expected) {
  if (!expected) return [];
  const problems = [];
  if ((current.name ?? '') !== expected.name) {
    problems.push(`user.name is "${current.name ?? ''}", expected "${expected.name}"`);
  }
  if ((current.email ?? '').toLowerCase() !== expected.email.toLowerCase()) {
    problems.push(`user.email is "${current.email ?? ''}", expected "${expected.email}"`);
  }
  return problems;
}

/** Bots and GitHub's own committer for web merges are never checked. */
export function isBot(name, email) {
  const lowerEmail = (email ?? '').toLowerCase();
  return (
    /\[bot\]$/i.test(name ?? '') ||
    /\[bot\]@users\.noreply\.github\.com$/.test(lowerEmail) ||
    lowerEmail === 'noreply@github.com'
  );
}

/**
 * Checks `sha|authorName|authorEmail|committerName|committerEmail` lines (from
 * `git log --format=%H|%an|%ae|%cn|%ce`) against blocked-term patterns. Reports term numbers only.
 */
export function checkLog(lines, patterns) {
  const problems = [];
  for (const line of lines) {
    const [sha = '', authorName, authorEmail, committerName, committerEmail] = line.split('|');
    const people = [
      ['author', authorName, authorEmail],
      ['committer', committerName, committerEmail],
    ];
    for (const [role, name, email] of people) {
      if (isBot(name, email)) continue;
      patterns.forEach((pattern, index) => {
        if (pattern.test(email ?? '')) {
          problems.push(`${sha.slice(0, 10)} ${role} email matches blocked term #${index + 1}`);
        }
      });
    }
  }
  return problems;
}

function git(args, cwd) {
  try {
    return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

function checkRange(root, range) {
  const terms = loadTerms({ root });
  if (terms.length === 0) {
    console.warn('identity: no blocked-terms list available; skipping the email check.');
    return 0;
  }
  const lines = git(['log', '--format=%H|%an|%ae|%cn|%ce', range], root)
    .split('\n')
    .filter(Boolean);
  const problems = checkLog(lines, compile(terms));
  if (problems.length > 0) {
    console.error('Commits with an email that must not be used in this repository:');
    for (const problem of problems) console.error(`  ${problem}`);
    console.error('Rewrite those commits with your public or noreply email before pushing.');
    return 1;
  }
  console.log(`identity: ${lines.length} commit(s) OK.`);
  return 0;
}

function checkLocal(root) {
  const expected = loadIdentity(root);
  if (!expected) return 0;
  const current = {
    name: process.env.GIT_AUTHOR_NAME ?? git(['config', 'user.name'], root),
    email: process.env.GIT_AUTHOR_EMAIL ?? git(['config', 'user.email'], root),
  };
  const problems = checkIdentity(current, expected);
  if (problems.length === 0) return 0;
  console.error(`Commit blocked: the Git identity does not match ${IDENTITY_FILE}.`);
  for (const problem of problems) console.error(`  - ${problem}`);
  console.error(
    'Fix it with `git config --local user.name ...` and `git config --local user.email ...`,'
  );
  console.error(`or update ${IDENTITY_FILE} if it is out of date.`);
  return 1;
}

function main() {
  const root = fileURLToPath(new URL('../../', import.meta.url));
  const rangeIndex = process.argv.indexOf('--range');
  process.exitCode =
    rangeIndex === -1 ? checkLocal(root) : checkRange(root, process.argv[rangeIndex + 1] ?? 'HEAD');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
