#!/usr/bin/env node
// Markdown reports for scheduled maintenance workflows.
//
//   node tools/deps/reports.mjs audit --out report.md      vulnerabilities (npm audit)
//   node tools/deps/reports.mjs outdated --out report.md   available updates (needs node_modules)
//
// Writes `findings=true|false` to $GITHUB_OUTPUT so the workflow can open, update or close an issue.
import { spawnSync } from 'node:child_process';
import { appendFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { bumpKind, isPinned } from './dependency-changes.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const severities = ['critical', 'high', 'moderate', 'low', 'info'];

const cell = value => String(value ?? '').replaceAll('|', '\\|');

function advisories(entry) {
  return (entry.via ?? [])
    .map(via => (typeof via === 'string' ? `via ${via}` : `[${via.title}](${via.url})`))
    .join('<br>');
}

function fix(entry) {
  const available = entry.fixAvailable;
  if (available === true) return '`npm audit fix`';
  if (!available) return 'No fix yet';
  return `${available.name}@${available.version}${available.isSemVerMajor ? ' (major)' : ''}`;
}

/**
 * Renders `npm audit --json` output. `runtime` is the same report with `--omit=dev`, used to flag
 * vulnerabilities that reach consumers or the apps at run time.
 */
export function renderAudit(all, runtime = {}) {
  const entries = Object.values(all.vulnerabilities ?? {}).sort(
    (a, b) => severities.indexOf(a.severity) - severities.indexOf(b.severity)
  );
  if (entries.length === 0) return { findings: false, markdown: 'No known vulnerabilities.\n' };
  const runtimeNames = new Set(Object.keys(runtime.vulnerabilities ?? {}));
  const totals = all.metadata?.vulnerabilities ?? {};
  const rows = entries.map(
    entry =>
      `| ${cell(entry.name)} | ${entry.severity} | ${runtimeNames.has(entry.name) ? 'runtime' : 'development'} | ${entry.isDirect ? 'direct' : 'transitive'} | ${advisories(entry)} | ${cell(fix(entry))} |`
  );
  return {
    findings: true,
    markdown: [
      `**${entries.length} vulnerable packages** (${severities
        .filter(severity => totals[severity])
        .map(severity => `${totals[severity]} ${severity}`)
        .join(', ')}).`,
      '',
      'Runtime findings reach consumers or apps: fix them first, with a patch changeset for the',
      'affected packages. Use the upgrade-stack skill for majors or pinned stack updates.',
      '',
      '| Package | Severity | Scope | Dependency | Advisories | Fix |',
      '| --- | --- | --- | --- | --- | --- |',
      ...rows,
      '',
    ].join('\n'),
  };
}

/**
 * Renders `npm outdated --json` output. Pinned stack minors/majors and other majors need a planned
 * upgrade; patches of the pinned stack and other minors/patches arrive as Dependabot pull requests.
 */
export function renderOutdated(outdated) {
  const rows = Object.entries(outdated ?? {}).flatMap(([name, value]) =>
    (Array.isArray(value) ? value : [value]).map(item => {
      const kind = bumpKind(item.current ?? item.wanted, item.latest);
      return { name, ...item, kind, pinned: isPinned(name) };
    })
  );
  if (rows.length === 0) return { findings: false, markdown: 'Every dependency is up to date.\n' };
  const table = items =>
    items.length === 0
      ? ['None.', '']
      : [
          '| Package | Workspace | Current | Wanted | Latest |',
          '| --- | --- | --- | --- | --- |',
          ...items.map(
            item =>
              `| ${cell(item.name)} | ${cell(item.dependent)} | ${cell(item.current ?? 'missing')} | ${cell(item.wanted)} | ${cell(item.latest)} |`
          ),
          '',
        ];
  const planned = item => item.kind === 'major' || (item.pinned && item.kind === 'minor');
  const pinned = rows.filter(item => item.pinned && planned(item));
  const majors = rows.filter(item => !item.pinned && planned(item));
  const rest = rows.filter(item => !planned(item));
  return {
    findings: pinned.length + majors.length > 0,
    markdown: [
      'Dependabot opens pull requests for minor and patch updates. Majors and the pinned stack need',
      'a planned upgrade with the upgrade-stack skill (read the release notes and migration guides).',
      '',
      '### Pinned stack (minor or major)',
      '',
      ...table(pinned),
      '### Major updates',
      '',
      ...table(majors),
      '### Handled by Dependabot (minor and patch)',
      '',
      ...table(rest),
    ].join('\n'),
  };
}

function npmJson(args) {
  // npm exits with 1 when it finds vulnerabilities or outdated packages; the JSON is still valid.
  // A single command string: Windows needs a shell for npm.cmd and the arguments are fixed literals.
  const result = spawnSync(`npm ${args.join(' ')}`, {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    shell: true,
  });
  try {
    return JSON.parse(result.stdout || '{}');
  } catch {
    throw new Error(`npm ${args.join(' ')} failed: ${result.stderr}`);
  }
}

function main() {
  const [command, ...args] = process.argv.slice(2);
  const outIndex = args.indexOf('--out');
  const out = outIndex === -1 ? undefined : args[outIndex + 1];
  let report;
  if (command === 'audit') {
    report = renderAudit(npmJson(['audit', '--json']), npmJson(['audit', '--json', '--omit=dev']));
  } else if (command === 'outdated') {
    report = renderOutdated(
      npmJson(['outdated', '--json', '--workspaces', '--include-workspace-root'])
    );
  } else {
    console.error('Usage: reports.mjs <audit|outdated> [--out file]');
    process.exitCode = 2;
    return;
  }
  if (out) writeFileSync(out, report.markdown);
  else console.log(report.markdown);
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `findings=${report.findings}\n`);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
