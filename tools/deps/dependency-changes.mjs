#!/usr/bin/env node
// Classifies dependency changes in package manifests between a base ref and HEAD.
//
//   node tools/deps/dependency-changes.mjs pr --base origin/develop        Dependabot PR check
//   node tools/deps/dependency-changes.mjs release --base origin/main      release PR check
//   node tools/deps/dependency-changes.mjs write --base origin/main        writes a patch changeset
//   node tools/deps/dependency-changes.mjs automerge --base origin/develop prints automerge=true|false
//
// Only publishable packages (`packages/*`, not private) affect consumers. Runtime patch/minor updates
// are deferred to the release (`write`); majors, peer ranges, added/removed runtime dependencies and
// the pinned stack need a human decision and a changeset in the same pull request.
import { execFileSync } from 'node:child_process';
import { appendFileSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));

/** Kept in sync with the `pinned-stack` group of `.github/dependabot.yml` (checked by a test). */
export const pinnedStack = [
  'typescript',
  '@angular/*',
  'expo',
  'expo-*',
  '@expo/*',
  'react-native',
  'react-native-*',
  'react',
  'react-dom',
];

const internalScope = '@joralvmel/cosmos-';
const runtimeSections = ['dependencies', 'optionalDependencies'];
const sections = [...runtimeSections, 'peerDependencies', 'devDependencies'];

export function isPinned(name) {
  return pinnedStack.some(pattern =>
    pattern.endsWith('*') ? name.startsWith(pattern.slice(0, -1)) : name === pattern
  );
}

/** Lower bound of a semver range as [major, minor, patch], or undefined (tags, URLs, workspaces). */
export function lowerBound(range) {
  const match = /^[\s^~>=v]*(\d+)(?:\.(\d+|x|\*))?(?:\.(\d+|x|\*))?/.exec(range ?? '');
  if (!match) return undefined;
  return [match[1], match[2], match[3]].map(part =>
    part && /^\d+$/.test(part) ? Number(part) : 0
  );
}

/** Semver distance between two ranges. A 0.x minor bump is breaking, so it counts as major. */
export function bumpKind(from, to) {
  if (from === undefined) return 'added';
  if (to === undefined) return 'removed';
  const a = lowerBound(from);
  const b = lowerBound(to);
  if (!a || !b) return 'unknown';
  for (let index = 0; index < 3; index++) {
    if (a[index] === b[index]) continue;
    if (b[index] < a[index]) return 'unknown';
    if (index === 0 || (index === 1 && a[0] === 0)) return 'major';
    return index === 1 ? 'minor' : 'patch';
  }
  return 'none';
}

/** Changed external dependencies of one manifest. */
export function diffManifest(before = {}, after = {}) {
  const changes = [];
  for (const section of sections) {
    const old = before[section] ?? {};
    const next = after[section] ?? {};
    for (const dependency of new Set([...Object.keys(old), ...Object.keys(next)])) {
      if (dependency.startsWith(internalScope) || old[dependency] === next[dependency]) continue;
      const from = old[dependency];
      const to = next[dependency];
      changes.push({ dependency, section, from, to, kind: bumpKind(from, to) });
    }
  }
  return changes;
}

/**
 * Release impact of a change: `none` (development only or private workspace), `patch` (runtime
 * patch/minor outside the pinned stack) or `manual` (needs a human decision and changeset).
 */
export function impact(change, { publishable }) {
  if (!publishable || change.section === 'devDependencies') return 'none';
  if (change.section === 'peerDependencies' || isPinned(change.dependency)) return 'manual';
  return change.kind === 'patch' || change.kind === 'minor' ? 'patch' : 'manual';
}

/** Workspace summaries with their changes and the strongest impact. */
export function classify(manifests) {
  const order = { none: 0, patch: 1, manual: 2 };
  return manifests
    .map(({ path, before, after }) => {
      const manifest = after ?? before ?? {};
      const publishable = /^packages\/[^/]+\/package\.json$/.test(path) && !manifest.private;
      const changes = diffManifest(before, after).map(change => ({
        ...change,
        impact: impact(change, { publishable }),
      }));
      const level = changes.reduce(
        (max, change) => (order[change.impact] > order[max] ? change.impact : max),
        'none'
      );
      return { path, name: manifest.name ?? path, publishable, changes, impact: level };
    })
    .filter(item => item.changes.length > 0);
}

/** Package names released by changeset files (frontmatter keys). */
export function changesetPackages(texts) {
  const names = new Set();
  for (const text of texts) {
    const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text)?.[1] ?? '';
    for (const [, name] of frontmatter.matchAll(/^\s*['"]?([^'":\s]+)['"]?\s*:/gm)) names.add(name);
  }
  return names;
}

/** Decision for a Dependabot pull request into develop. */
export function checkPullRequest(packages, covered) {
  const blocking = packages.filter(item => item.impact === 'manual' && !covered.has(item.name));
  return { ok: blocking.length === 0, blocking };
}

/** Decision for a release pull request: every released runtime update needs a pending changeset. */
export function checkRelease(packages, covered) {
  const missing = packages.filter(item => item.impact !== 'none' && !covered.has(item.name));
  return { ok: missing.length === 0, missing };
}

/** True when every manifest change is a non-major development tooling update. */
export function canAutomerge(packages, changedFiles) {
  const onlyManifests = changedFiles.every(
    file => file === 'package-lock.json' || file.endsWith('package.json')
  );
  const changes = packages.flatMap(item => item.changes);
  return (
    onlyManifests &&
    changes.length > 0 &&
    changes.every(
      change =>
        change.impact === 'none' &&
        (change.kind === 'patch' || change.kind === 'minor') &&
        !isPinned(change.dependency)
    )
  );
}

const describeChange = change =>
  `\`${change.dependency}\` ${change.from ?? '(added)'} → ${change.to ?? '(removed)'}`;

/** Markdown changeset releasing `patch` for packages with uncovered runtime updates. */
export function renderChangeset(packages, covered) {
  const released = packages.filter(item => item.impact === 'patch' && !covered.has(item.name));
  if (released.length === 0) return '';
  const header = released.map(item => `'${item.name}': patch`).join('\n');
  const lines = released.flatMap(item =>
    item.changes
      .filter(change => change.impact === 'patch')
      .map(change => `- ${item.name}: ${describeChange(change)}`)
  );
  return `---\n${header}\n---\n\nUpdate runtime dependencies.\n\n${lines.join('\n')}\n`;
}

export function renderSummary(packages) {
  if (packages.length === 0) return 'No external dependency changes in package manifests.\n';
  const rows = packages.flatMap(item =>
    item.changes.map(
      change =>
        `| ${item.name} | ${describeChange(change)} | ${change.section} | ${change.kind} | ${change.impact} |`
    )
  );
  return [
    '| Workspace | Change | Section | Update | Release impact |',
    '| --- | --- | --- | --- | --- |',
    ...rows,
    '',
  ].join('\n');
}

const git = (...args) =>
  execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

function readAt(ref, path) {
  try {
    return JSON.parse(git('show', `${ref}:${path}`));
  } catch {
    return undefined;
  }
}

function changedFiles(base) {
  return git('diff', '--name-only', `${base}...HEAD`).split('\n').filter(Boolean);
}

function loadManifests(base) {
  const mergeBase = git('merge-base', base, 'HEAD').trim();
  return changedFiles(base)
    .filter(file => file.endsWith('package.json'))
    .map(path => ({ path, before: readAt(mergeBase, path), after: readAt('HEAD', path) }));
}

function pendingChangesets(files) {
  const dir = join(root, '.changeset');
  const names = files ?? readdirSync(dir).map(name => `.changeset/${name}`);
  return names
    .filter(file => /^\.changeset\/[^/]+\.md$/.test(file) && !file.endsWith('README.md'))
    .map(file => {
      try {
        return readFileSync(join(root, file), 'utf8');
      } catch {
        return '';
      }
    });
}

function report(text) {
  console.log(text);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${text}\n`);
}

function main() {
  const [command, ...args] = process.argv.slice(2);
  const baseIndex = args.indexOf('--base');
  const base = baseIndex === -1 ? undefined : args[baseIndex + 1];
  if (!['pr', 'release', 'write', 'automerge'].includes(command ?? '') || !base) {
    console.error('Usage: dependency-changes.mjs <pr|release|write|automerge> --base <ref>');
    process.exitCode = 2;
    return;
  }
  const packages = classify(loadManifests(base));

  if (command === 'automerge') {
    console.log(`automerge=${canAutomerge(packages, changedFiles(base))}`);
    return;
  }

  report(`### Dependency changes since ${base}\n\n${renderSummary(packages)}`);

  if (command === 'pr') {
    const added = changedFiles(base).filter(file => file.startsWith('.changeset/'));
    const result = checkPullRequest(packages, changesetPackages(pendingChangesets(added)));
    if (result.ok) {
      report('No manual decision needed. Runtime updates get a changeset before the release.');
      return;
    }
    report(
      `Needs a decision and a changeset in this pull request: ${result.blocking
        .map(item => item.name)
        .join(', ')}. Use the upgrade-stack skill or add one with \`npm run changeset\`.`
    );
    process.exitCode = 1;
    return;
  }

  const covered = changesetPackages(pendingChangesets());
  if (command === 'write') {
    const text = renderChangeset(packages, covered);
    if (!text) {
      console.log('No uncovered runtime patch updates; nothing written.');
    } else {
      const file = `.changeset/dependency-updates-${new Date().toISOString().slice(0, 10)}.md`;
      writeFileSync(join(root, file), text);
      console.log(`Wrote ${file}`);
    }
    const manual = packages.filter(item => item.impact === 'manual' && !covered.has(item.name));
    if (manual.length > 0) {
      console.log(`Decide manually: ${manual.map(item => item.name).join(', ')}`);
    }
    return;
  }

  const result = checkRelease(packages, covered);
  if (result.ok) {
    report('Every released runtime dependency update has a changeset.');
    return;
  }
  report(
    `Runtime dependency updates without a changeset: ${result.missing
      .map(item => item.name)
      .join(', ')}. Run \`npm run deps:changeset\` on develop before the release.`
  );
  process.exitCode = 1;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
