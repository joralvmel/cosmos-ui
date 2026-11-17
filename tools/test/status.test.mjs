import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
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

  it.each([
    [
      '### `<cosm-listbox>`\nEvents: `cosm-selection-change`.',
      '### `Listbox`\nSelect an option.',
      false,
    ],
    ['### `<cosm-select>`', '### `Listbox`', false],
    ['### `<cosm-listbox>`', '### `Select`', false],
    ['### `<cosm-select>`', '### `Select`', true],
  ])(
    'requires exact reference headings on every supported platform (%#)',
    (web, native, expected) => {
      const entry = catalog.find(item => item.name === 'select');
      if (!entry) throw new Error('select missing from the catalog');
      const root = mkdtempSync(join(tmpdir(), 'cosmos-status-'));
      try {
        mkdirSync(join(root, 'packages/elements'), { recursive: true });
        mkdirSync(join(root, 'packages/native'), { recursive: true });
        writeFileSync(join(root, 'packages/elements/llms.md'), web);
        writeFileSync(join(root, 'packages/native/llms.md'), native);
        const [select] = getStatusReport(root, [entry]).components;
        expect(select?.pieces.llms).toBe(expected);
        expect(select?.status).toBe(expected ? 'in-progress' : 'planned');
      } finally {
        rmSync(root, { recursive: true, force: true });
      }
    }
  );

  it('every implemented component is in the catalog', () => {
    for (const name of implementedNames()) expect(names, name).toContain(name);
  });

  it('components claimed stable have every piece', () => {
    for (const item of report.components.filter(component => component.claimed === 'stable')) {
      expect(item.missing, item.name).toEqual([]);
      expect(item.status, item.name).toBe('stable');
    }
  });

  it('honors an explicit readiness downgrade for a complete component', () => {
    const entry = catalog.find(item => item.name === 'text-field');
    if (!entry) throw new Error('text-field missing from the catalog');
    const [textField] = getStatusReport(ROOT, [{ ...entry, status: 'in-progress' }]).components;
    expect(textField?.missing).toEqual([]);
    expect(textField?.todos).toEqual([]);
    expect(textField?.claimed).toBe('in-progress');
    expect(computeStatus(textField?.pieces ?? {})).toBe('stable');
    expect(textField?.status).toBe('in-progress');
  });

  it('does not apply readiness downgrades to other catalog entries', () => {
    const entry = catalog.find(item => item.name === 'button');
    if (!entry) throw new Error('button missing from the catalog');
    const [button] = getStatusReport(ROOT, [{ ...entry, status: undefined }]).components;
    expect(button?.claimed).toBeUndefined();
    expect(button?.status).toBe(computeStatus(button?.pieces ?? {}));
  });

  it('marks pieces that do not apply to native-only components', () => {
    const base = catalog.find(item => item.name === 'bottom-sheet');
    if (!base) throw new Error('bottom-sheet missing from the catalog');
    const [sheet] = getStatusReport(ROOT, [{ ...base, name: 'not-implemented-sheet' }]).components;
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
