#!/usr/bin/env node
// Fails when files contain blocked terms. The list never lives in the repository: it comes from
// the COSMOS_BLOCKED_TERMS environment variable (CI secret) or the git-ignored
// .local/blocked-terms.txt file. Matches are reported by term number, never by term.
//
//   node tools/check-terms.mjs            all tracked and untracked (not ignored) files
//   node tools/check-terms.mjs --staged   files staged for commit (pre-commit hook)
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const binary = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.ico',
  '.webp',
  '.woff',
  '.woff2',
  '.ttf',
]);

/** Parses a newline- or comma-separated list; `#` starts a comment line. */
export function parseTerms(text) {
  return text
    .split(/[\n,]/)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));
}

export function loadTerms({ env = process.env, root = process.cwd() } = {}) {
  if (env.COSMOS_BLOCKED_TERMS?.trim()) return parseTerms(env.COSMOS_BLOCKED_TERMS);
  const file = join(root, '.local', 'blocked-terms.txt');
  return existsSync(file) ? parseTerms(readFileSync(file, 'utf8')) : [];
}

const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Case-insensitive, whole-token matching: "abc" matches "abc-x" but not "abcd". */
export function compile(terms) {
  return terms.map(term => new RegExp(`(?<![a-z0-9])${escapeRegExp(term)}(?![a-z0-9])`, 'i'));
}

export function findMatches(text, patterns) {
  const findings = [];
  text.split('\n').forEach((line, index) => {
    patterns.forEach((pattern, term) => {
      if (pattern.test(line)) findings.push({ line: index + 1, term: term + 1 });
    });
  });
  return findings;
}

function gitFiles(root, staged) {
  const git = args =>
    execFileSync('git', args, { cwd: root, encoding: 'utf8' }).split('\n').filter(Boolean);
  return staged
    ? git(['diff', '--cached', '--name-only', '--diff-filter=ACMR'])
    : [...git(['ls-files']), ...git(['ls-files', '--others', '--exclude-standard'])];
}

export function checkFiles(root, files, patterns) {
  const findings = [];
  for (const file of files) {
    for (const finding of findMatches(file, patterns)) findings.push({ file, ...finding, line: 0 });
    const path = join(root, file);
    if (binary.has(extname(file).toLowerCase()) || !existsSync(path)) continue;
    for (const finding of findMatches(readFileSync(path, 'utf8'), patterns)) {
      findings.push({ file, ...finding });
    }
  }
  return findings;
}

function main() {
  const root = fileURLToPath(new URL('..', import.meta.url));
  const terms = loadTerms({ root });
  if (terms.length === 0) {
    const message =
      'check-terms: no blocked-terms list (COSMOS_BLOCKED_TERMS or .local/blocked-terms.txt).';
    if (process.env.COSMOS_REQUIRE_TERMS === '1') {
      console.error(`${message} Required in this environment.`);
      process.exit(1);
    }
    console.warn(`${message} Skipping.`);
    return;
  }
  const files = gitFiles(root, process.argv.includes('--staged'));
  const findings = checkFiles(root, files, compile(terms));
  if (findings.length > 0) {
    console.error(`check-terms: ${findings.length} blocked term(s) found:`);
    for (const { file, line, term } of findings) {
      console.error(`  ${file}${line ? `:${line}` : ' (path)'}  term #${term}`);
    }
    process.exit(1);
  }
  console.log(`check-terms: ${files.length} files clean.`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
