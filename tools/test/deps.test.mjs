import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  bumpKind,
  canAutomerge,
  changesetPackages,
  checkPullRequest,
  checkRelease,
  classify,
  pinnedStack,
  renderChangeset,
} from '../deps/dependency-changes.mjs';
import { renderAudit, renderOutdated } from '../deps/reports.mjs';
import { planIssue } from '../github/upsert-issue.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));

const manifest = (path, name, before, after, extra = {}) => ({
  path,
  before: { name, ...extra, ...before },
  after: { name, ...extra, ...after },
});

describe('bumpKind', () => {
  it('reads semver distance from ranges and treats 0.x minors as breaking', () => {
    expect(bumpKind('^3.2.1', '^3.2.4')).toBe('patch');
    expect(bumpKind('~3.2.1', '~3.3.0')).toBe('minor');
    expect(bumpKind('^3.2.1', '^4.0.0')).toBe('major');
    expect(bumpKind('^0.4.0', '^0.5.0')).toBe('major');
    expect(bumpKind(undefined, '^1.0.0')).toBe('added');
    expect(bumpKind('^1.0.0', undefined)).toBe('removed');
    expect(bumpKind('latest', '^1.0.0')).toBe('unknown');
  });
});

describe('dependency classification', () => {
  const packages = classify([
    manifest(
      'packages/elements/package.json',
      '@joralvmel/cosmos-elements',
      { dependencies: { lit: '^3.3.0', '@joralvmel/cosmos-core': '0.1.0' } },
      { dependencies: { lit: '^3.3.2', '@joralvmel/cosmos-core': '0.2.0' } }
    ),
    manifest(
      'packages/native/package.json',
      '@joralvmel/cosmos-native',
      { dependencies: { 'react-native-svg': '15.16.0' } },
      { dependencies: { 'react-native-svg': '15.16.1' } }
    ),
    manifest(
      'packages/tokens/package.json',
      '@joralvmel/cosmos-tokens',
      { devDependencies: { vitest: '^5.0.0' } },
      { devDependencies: { vitest: '^5.1.0' } }
    ),
    manifest(
      'apps/docs/package.json',
      '@joralvmel/cosmos-docs',
      { dependencies: { astro: '^7.0.0' } },
      { dependencies: { astro: '^8.0.0' } },
      { private: true }
    ),
  ]);
  const byName = name => packages.find(item => item.name === name);

  it('ignores internal packages and grades the release impact', () => {
    expect(byName('@joralvmel/cosmos-elements')?.changes).toHaveLength(1);
    expect(byName('@joralvmel/cosmos-elements')?.impact).toBe('patch');
    expect(byName('@joralvmel/cosmos-native')?.impact).toBe('manual');
    expect(byName('@joralvmel/cosmos-tokens')?.impact).toBe('none');
    expect(byName('@joralvmel/cosmos-docs')?.impact).toBe('none');
  });

  it('blocks a pull request only for uncovered manual decisions', () => {
    expect(checkPullRequest(packages, new Set()).blocking.map(item => item.name)).toEqual([
      '@joralvmel/cosmos-native',
    ]);
    expect(checkPullRequest(packages, new Set(['@joralvmel/cosmos-native'])).ok).toBe(true);
  });

  it('requires a changeset for every released runtime update', () => {
    expect(checkRelease(packages, new Set(['@joralvmel/cosmos-native'])).missing).toHaveLength(1);
    const text = renderChangeset(packages, new Set(['@joralvmel/cosmos-native']));
    expect(changesetPackages([text])).toEqual(new Set(['@joralvmel/cosmos-elements']));
    expect(text).toContain('`lit` ^3.3.0 → ^3.3.2');
  });

  it('auto-merges only non-major development updates of manifests and the lockfile', () => {
    const dev = packages.filter(item => item.name === '@joralvmel/cosmos-tokens');
    expect(canAutomerge(dev, ['packages/tokens/package.json', 'package-lock.json'])).toBe(true);
    expect(canAutomerge(dev, ['packages/tokens/package.json', 'tools/check.mjs'])).toBe(false);
    expect(canAutomerge(packages, ['package-lock.json'])).toBe(false);
    expect(canAutomerge([], ['package-lock.json'])).toBe(false);
  });

  it('keeps the pinned stack in sync with the Dependabot group', () => {
    const config = readFileSync(join(root, '.github/dependabot.yml'), 'utf8');
    const group = config.split('pinned-stack:')[1]?.split('update-types')[0] ?? '';
    expect([...group.matchAll(/- "([^"]+)"/g)].map(match => match[1])).toEqual(pinnedStack);
  });
});

describe('maintenance reports', () => {
  it('flags runtime vulnerabilities and their fixes', () => {
    const vulnerable = {
      vulnerabilities: {
        leftpad: {
          name: 'leftpad',
          severity: 'high',
          isDirect: false,
          via: [{ title: 'Prototype pollution', url: 'https://example.com/advisory' }],
          fixAvailable: { name: 'parent', version: '2.0.0', isSemVerMajor: true },
        },
      },
      metadata: { vulnerabilities: { high: 1 } },
    };
    const report = renderAudit(vulnerable, vulnerable);
    expect(report.findings).toBe(true);
    expect(report.markdown).toContain('| leftpad | high | runtime | transitive |');
    expect(report.markdown).toContain('parent@2.0.0 (major)');
    expect(renderAudit({ vulnerabilities: {} }).findings).toBe(false);
  });

  it('opens a report only for majors and the pinned stack', () => {
    const minorOnly = renderOutdated({
      lit: { current: '3.3.0', wanted: '3.3.2', latest: '3.4.0', dependent: 'elements' },
      react: { current: '19.3.0', wanted: '19.3.1', latest: '19.3.1', dependent: 'react' },
    });
    expect(minorOnly.findings).toBe(false);
    const report = renderOutdated({
      typescript: [{ current: '6.0.2', wanted: '6.0.3', latest: '7.0.0', dependent: 'root' }],
      culori: { current: '4.0.1', wanted: '4.0.1', latest: '5.0.0', dependent: 'tokens' },
    });
    expect(report.findings).toBe(true);
    expect(report.markdown.split('### Major updates')[0]).toContain('| typescript |');
    expect(report.markdown.split('### Major updates')[1]).toContain('| culori |');
  });

  it('keeps one issue per report', () => {
    expect(planIssue({ findings: true })).toEqual({ action: 'create' });
    expect(planIssue({ existing: 7, findings: true })).toEqual({ action: 'update', number: 7 });
    expect(planIssue({ existing: 7, findings: false })).toEqual({ action: 'close', number: 7 });
    expect(planIssue({ findings: false })).toEqual({ action: 'none' });
  });
});
