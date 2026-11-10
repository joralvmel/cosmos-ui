#!/usr/bin/env node
// Component inventory: compares the catalog (packages/core/src/catalog.ts) with what exists in the
// repository and computes each component status.
//
//   npm run status                 table for humans
//   npm run status -- --json       machine-readable report (docs site, MCP, agents)
//   npm run status -- --markdown   Markdown report (pull requests, issues)
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { catalog } from '@joralvmel/cosmos-core';

/** Repository root: the closest folder with `turbo.json` and `packages/` (works when bundled too). */
export function findRoot(start) {
  let dir = resolve(start);
  for (;;) {
    if (existsSync(join(dir, 'turbo.json')) && existsSync(join(dir, 'packages', 'core')))
      return dir;
    const parent = dirname(dir);
    if (parent === dir) return undefined;
    dir = parent;
  }
}

export const ROOT =
  findRoot(fileURLToPath(new URL('.', import.meta.url))) ??
  findRoot(process.cwd()) ??
  process.cwd();

const pascal = name =>
  name
    .split('-')
    .map(word => word[0].toUpperCase() + word.slice(1))
    .join('');
const camel = name => {
  const value = pascal(name);
  return value[0].toLowerCase() + value.slice(1);
};

/** Labels of the pieces, in report order. */
export const PIECES = {
  contract: 'Contract',
  scenarios: 'Scenarios',
  web: 'Web Component',
  react: 'React',
  angular: 'Angular',
  native: 'React Native',
  nativeDemo: 'Native demo',
  tests: 'Tests',
  docsEn: 'Docs (EN)',
  docsEs: 'Docs (ES)',
  llms: 'llms.md',
  changeset: 'Changeset',
};

/** Paths of every piece of a component (see docs/conventions/component-anatomy.md). */
export function piecePaths(name) {
  return {
    contract: `packages/core/src/specs/${name}.ts`,
    scenarios: `packages/core/src/specs/${name}.scenarios.ts`,
    web: `packages/elements/src/components/${name}/cosm-${name}.ts`,
    react: `packages/react/src/components/${name}.ts`,
    angular: `packages/angular/src/components/${name}.component.ts`,
    native: `packages/native/src/components/${name}.tsx`,
    nativeDemo: `apps/native-demo/app/${name}.tsx`,
    testsWeb: `packages/elements/test/${name}.test.ts`,
    testsReact: `packages/react/test/${name}.test.tsx`,
    testsAngular: `packages/angular/test/${name}.test.ts`,
    testsNative: `packages/native/test/${name}.test.tsx`,
    docsEn: `apps/docs/src/content/docs/components/${name}.mdx`,
    docsEs: `apps/docs/src/content/docs/es/components/${name}.mdx`,
  };
}

function read(root, path) {
  const full = join(root, path);
  return existsSync(full) ? readFileSync(full, 'utf8') : '';
}

function changesetTexts(root) {
  const dir = join(root, '.changeset');
  const pending = existsSync(dir)
    ? readdirSync(dir)
        .filter(file => file.endsWith('.md') && file !== 'README.md')
        .map(file => readFileSync(join(dir, file), 'utf8'))
    : [];
  const changelogs = ['elements', 'native', 'core'].map(pkg =>
    read(root, `packages/${pkg}/CHANGELOG.md`)
  );
  return [...pending, ...changelogs].join('\n');
}

/** Which pieces exist for one catalog entry. `undefined` = not applicable to its platforms. */
export function detectPieces(root, entry, changesets = changesetTexts(root)) {
  const paths = piecePaths(entry.name);
  const has = path => existsSync(join(root, path));
  const web = entry.platforms.includes('web');
  const native = entry.platforms.includes('native');
  const tag = `cosm-${entry.name}`;
  const component = pascal(entry.name);
  const testFiles = [
    web && paths.testsWeb,
    entry.platforms.includes('react') && paths.testsReact,
    entry.platforms.includes('angular') && paths.testsAngular,
    native && paths.testsNative,
  ].filter(Boolean);
  const llms = [
    web && read(root, 'packages/elements/llms.md').includes(tag),
    native && new RegExp(`\\b${component}\\b`).test(read(root, 'packages/native/llms.md')),
  ].filter(value => value !== false);

  return {
    contract:
      has(paths.contract) &&
      read(root, 'packages/core/src/index.ts').includes(`${camel(entry.name)}Contract`),
    scenarios: has(paths.scenarios),
    web: web ? has(paths.web) : undefined,
    react: entry.platforms.includes('react')
      ? has(paths.react) || has(paths.react.replace(/\.ts$/, '.tsx'))
      : undefined,
    angular: entry.platforms.includes('angular') ? has(paths.angular) : undefined,
    native: native ? has(paths.native) : undefined,
    nativeDemo: native ? has(paths.nativeDemo) : undefined,
    tests:
      testFiles.length > 0 &&
      testFiles.every(path => has(path) || has(path.replace(/\.tsx$/, '.ts'))),
    docsEn: has(paths.docsEn),
    docsEs: has(paths.docsEs),
    llms: llms.length > 0 && llms.every(Boolean),
    changeset: new RegExp(`\\b(${tag}|${component})\\b`).test(changesets),
  };
}

export function computeStatus(pieces) {
  const applicable = Object.values(pieces).filter(value => value !== undefined);
  if (applicable.every(value => value === true)) return 'stable';
  if (applicable.some(value => value === true)) return 'in-progress';
  return 'planned';
}

const priorityOf = { 1: 0, 2: 1, 3: 2 };
const batchOrder = ['A', 'internal', 'B', 'C', 'D', 'E', 'mobile'];

/** Full report: every catalog entry with pieces, status, gaps and the suggested next components. */
export function getStatusReport(root = ROOT, entries = catalog) {
  const changesets = changesetTexts(root);
  const components = entries.map(entry => {
    const pieces = detectPieces(root, entry, changesets);
    const todos = Object.values(piecePaths(entry.name)).filter(path =>
      read(root, path).includes('TODO(generator)')
    );
    const detected = computeStatus(pieces);
    const status = detected === 'stable' && todos.length > 0 ? 'in-progress' : detected;
    return {
      name: entry.name,
      title: entry.title,
      category: entry.category,
      batch: entry.batch,
      priority: entry.priority,
      platforms: [...entry.platforms],
      dependsOn: [...entry.dependsOn],
      pattern: entry.pattern,
      target: entry.target,
      claimed: entry.status,
      notes: [...(entry.notes ?? [])],
      status,
      pieces,
      /** Files that still contain TODO(generator) markers. */
      todos,
      missing: Object.entries(pieces)
        .filter(([, value]) => value === false)
        .map(([key]) => key),
    };
  });
  const byName = new Map(components.map(item => [item.name, item]));
  for (const item of components) {
    item.blockedBy = item.dependsOn.filter(dep => byName.get(dep)?.status !== 'stable');
  }
  const next = components
    .filter(item => item.status !== 'stable' && item.blockedBy.length === 0)
    .sort(
      (a, b) =>
        (a.status === 'in-progress' ? -1 : 0) - (b.status === 'in-progress' ? -1 : 0) ||
        priorityOf[a.priority] - priorityOf[b.priority] ||
        batchOrder.indexOf(a.batch) - batchOrder.indexOf(b.batch)
    )
    .slice(0, 5)
    .map(item => item.name);
  const count = status => components.filter(item => item.status === status).length;
  return {
    summary: {
      total: components.length,
      stable: count('stable'),
      inProgress: count('in-progress'),
      planned: count('planned'),
    },
    next,
    gaps: components
      .filter(item => item.target === 'stable' && item.status !== 'stable')
      .map(item => ({ name: item.name, missing: item.missing, blockedBy: item.blockedBy })),
    components,
  };
}

const mark = value => (value === undefined ? '—' : value ? '✓' : '✗');

export function toMarkdown(report) {
  const keys = Object.keys(PIECES);
  const lines = [
    '# Component status',
    '',
    `${report.summary.stable} stable · ${report.summary.inProgress} in progress · ${report.summary.planned} planned (${report.summary.total} total)`,
    '',
    `Next: ${report.next.map(name => `\`${name}\``).join(', ') || '—'}`,
    '',
    `| Component | Status | Priority | ${keys.map(key => PIECES[key]).join(' | ')} | Depends on |`,
    `| --- | --- | --- | ${keys.map(() => '---').join(' | ')} | --- |`,
    ...report.components.map(
      item =>
        `| ${item.name} | ${item.status} | ${item.priority} | ${keys.map(key => mark(item.pieces[key])).join(' | ')} | ${item.dependsOn.join(', ') || '—'} |`
    ),
  ];
  return `${lines.join('\n')}\n`;
}

function toText(report) {
  const { summary } = report;
  const lines = [
    `Components: ${summary.total} · stable ${summary.stable} · in progress ${summary.inProgress} · planned ${summary.planned}`,
    '',
  ];
  for (const item of report.components) {
    const extra =
      item.status === 'stable'
        ? ''
        : item.status === 'planned'
          ? item.blockedBy.length
            ? `  (blocked by ${item.blockedBy.join(', ')})`
            : ''
          : item.missing.length > 0
            ? `  missing: ${item.missing.join(', ')}`
            : `  TODO(generator) markers in ${item.todos.length} file(s)`;
    lines.push(`${item.status.padEnd(12)} ${String(item.priority).padEnd(2)} ${item.name}${extra}`);
  }
  lines.push('', `Next suggested: ${report.next.join(', ') || '—'}`);
  return lines.join('\n');
}

function main() {
  const report = getStatusReport();
  if (process.argv.includes('--json')) console.log(JSON.stringify(report, null, 2));
  else if (process.argv.includes('--markdown')) process.stdout.write(toMarkdown(report));
  else console.log(toText(report));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
