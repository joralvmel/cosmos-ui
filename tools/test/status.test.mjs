import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { catalog } from '@joralvmel/cosmos-core';
import { describe, expect, it } from 'vitest';
import {
  computeStatus,
  findRoot,
  getStatusReport,
  ROOT,
  toMarkdown,
} from '../status/component-status.mjs';

const report = getStatusReport();
const names = new Set(catalog.map(item => item.name));

/** Component names found on disk, whatever the platform. */
function implementedNames() {
  const found = new Set();
  const specs = join(ROOT, 'packages/core/src/specs');
  for (const file of readdirSync(specs)) {
    if (file.endsWith('.ts') && !file.endsWith('.scenarios.ts')) found.add(file.replace('.ts', ''));
  }
  for (const dir of readdirSync(join(ROOT, 'packages/elements/src/components'))) found.add(dir);
  for (const file of readdirSync(join(ROOT, 'packages/native/src/components'))) {
    found.add(file.replace(/\.tsx?$/, ''));
  }
  return found;
}

describe('component status', () => {
  it('computes statuses from pieces', () => {
    expect(computeStatus({ contract: false, web: undefined })).toBe('planned');
    expect(computeStatus({ contract: true, web: false })).toBe('in-progress');
    expect(computeStatus({ contract: true, web: undefined, native: true })).toBe('stable');
  });

  it('every implemented component is in the catalog', () => {
    for (const name of implementedNames()) expect(names, name).toContain(name);
  });

  it('components claimed stable have every piece', () => {
    for (const item of report.components.filter(component => component.claimed === 'stable')) {
      expect(item.missing, item.name).toEqual([]);
      expect(item.status, item.name).toBe('stable');
    }
  });

  it('marks pieces that do not apply to native-only components', () => {
    const sheet = report.components.find(item => item.name === 'bottom-sheet');
    expect(sheet?.pieces.web).toBeUndefined();
    expect(sheet?.pieces.native).toBe(false);
  });

  it('suggests only components whose dependencies are stable', () => {
    const byName = new Map(report.components.map(item => [item.name, item]));
    expect(report.next.length).toBeGreaterThan(0);
    for (const name of report.next) {
      for (const dep of byName.get(name)?.dependsOn ?? []) {
        expect(byName.get(dep)?.status, `${name} → ${dep}`).toBe('stable');
      }
    }
  });

  it('finds the repository root from nested folders', () => {
    expect(findRoot(join(ROOT, 'apps/docs/src'))).toBe(ROOT);
  });

  it('renders a Markdown table with every component', () => {
    const markdown = toMarkdown(report);
    for (const name of names) expect(markdown).toContain(`| ${name} |`);
    expect(existsSync(join(ROOT, 'docs'))).toBe(true);
  });
});
