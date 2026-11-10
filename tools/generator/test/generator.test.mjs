import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { checkAnatomy } from '../../status/anatomy.mjs';
import { apply } from '../src/apply.mjs';
import { names } from '../src/names.mjs';
import { plan } from '../src/plan.mjs';

const repo = fileURLToPath(new URL('../../../', import.meta.url));
const anchored = [
  'packages/core/src/index.ts',
  'packages/core/src/catalog.ts',
  'packages/elements/src/index.ts',
  'packages/elements/package.json',
  'packages/elements/llms.md',
  'packages/react/src/index.ts',
  'packages/angular/src/index.ts',
  'packages/native/src/index.ts',
  'packages/native/llms.md',
  'packages/charts-core/src/index.ts',
  'packages/tokens/src/themes.ts',
  'apps/native-demo/src/screens.ts',
];

let sandbox;
function copyRepoFiles() {
  sandbox = mkdtempSync(join(tmpdir(), 'cosmos-generator-'));
  for (const file of anchored) cpSync(join(repo, file), join(sandbox, file));
  return sandbox;
}

afterEach(() => {
  if (sandbox) rmSync(sandbox, { recursive: true, force: true });
  sandbox = undefined;
});

describe('names', () => {
  it('derives naming variants', () => {
    expect(names('date-picker')).toEqual({
      kebab: 'date-picker',
      pascal: 'DatePicker',
      camel: 'datePicker',
      title: 'Date Picker',
      tag: 'cosm-date-picker',
    });
    expect(names('cosm-chip').kebab).toBe('chip');
  });

  it.each(['', 'DatePicker', 'date_picker', '1chip', 'chip-'])('rejects %j', input => {
    expect(() => names(input)).toThrow(/Invalid name/);
  });
});

describe('component target', () => {
  it('writes every layer and registers the component in the real anchor files', () => {
    const root = copyRepoFiles();
    const files = apply(root, plan('component', names('date-picker')));
    expect(files).toEqual(
      expect.arrayContaining([
        'packages/core/src/specs/date-picker.ts',
        'packages/elements/src/components/date-picker/cosm-date-picker.ts',
        'packages/react/src/components/date-picker.ts',
        'packages/angular/src/components/date-picker.component.ts',
        'packages/native/src/components/date-picker.tsx',
        'apps/native-demo/app/date-picker.tsx',
        'apps/docs/src/content/docs/components/date-picker.mdx',
        'apps/docs/src/content/docs/es/components/date-picker.mdx',
        '.changeset/add-date-picker.md',
      ])
    );
    const core = readFileSync(join(root, 'packages/core/src/index.ts'), 'utf8');
    expect(core).toContain("'date-picker': datePickerContract,");
    expect(core).toContain("import { datePickerContract } from './specs/date-picker.js';");
    const angular = readFileSync(join(root, 'packages/angular/src/index.ts'), 'utf8');
    expect(angular).toMatch(/\[CosmButtonComponent, CosmDatePickerComponent\] as const/);
    const pkg = JSON.parse(readFileSync(join(root, 'packages/elements/package.json'), 'utf8'));
    expect(Object.keys(pkg.exports)).toContain('./date-picker');
    const screens = readFileSync(join(root, 'apps/native-demo/src/screens.ts'), 'utf8');
    expect(screens).toContain("route: '/date-picker'");
    const catalog = readFileSync(join(root, 'packages/core/src/catalog.ts'), 'utf8');
    expect(catalog.match(/name: 'date-picker'/g)).toHaveLength(1);
  });

  it('adds a catalog entry and llms.md sections for components that are not planned yet', () => {
    const root = copyRepoFiles();
    apply(root, plan('component', names('chip')));
    expect(readFileSync(join(root, 'packages/core/src/catalog.ts'), 'utf8')).toContain(
      "entry({ name: 'chip', title: 'Chip'"
    );
    expect(readFileSync(join(root, 'packages/elements/llms.md'), 'utf8')).toContain(
      '`<cosm-chip>`'
    );
    expect(readFileSync(join(root, 'packages/native/llms.md'), 'utf8')).toContain('`Chip`');
  });

  it('generates files that follow the component anatomy', () => {
    const root = copyRepoFiles();
    apply(root, plan('component', names('chip')));
    expect(checkAnatomy(root, 'chip', ['web', 'react', 'angular', 'native'])).toEqual([]);
    const nativeRoot = copyRepoFiles();
    apply(nativeRoot, plan('native', names('bottom-sheet')));
    expect(checkAnatomy(nativeRoot, 'bottom-sheet', ['native'])).toEqual([]);
  });

  it('keeps the component templates stable (snapshot)', () => {
    const created = Object.fromEntries(
      plan('component', names('chip'))
        .filter(op => op.type === 'create' || op.type === 'append' || op.type === 'prepend')
        .map(op => [`${op.type} ${op.path}`, op.content])
    );
    expect(created).toMatchSnapshot();
  });

  it('marks generated code with TODO(generator)', () => {
    const contents = plan('component', names('chip'))
      .filter(op => op.type === 'create' && !op.path.startsWith('.changeset'))
      .map(op => op.content);
    expect(contents.some(content => content.includes('TODO(generator)'))).toBe(true);
  });

  it('refuses to overwrite and leaves the tree untouched on failure', () => {
    const root = copyRepoFiles();
    const before = readFileSync(join(root, 'packages/core/src/index.ts'), 'utf8');
    expect(() => apply(root, plan('component', names('button')))).toThrow(/overwrite|already/);
    expect(readFileSync(join(root, 'packages/core/src/index.ts'), 'utf8')).toBe(before);
  });

  it('supports dry runs', () => {
    const root = copyRepoFiles();
    apply(root, plan('component', names('chip')), { dryRun: true });
    expect(existsSync(join(root, 'packages/core/src/specs/chip.ts'))).toBe(false);
  });
});

describe('other targets', () => {
  it('adds a theme after the existing ones', () => {
    const root = copyRepoFiles();
    apply(root, plan('theme', names('aurora'), { seed: 'oklch(0.6 0.14 160)' }));
    const themes = readFileSync(join(root, 'packages/tokens/src/themes.ts'), 'utf8');
    expect(themes).toContain("name: 'aurora'");
    expect(themes).toMatch(/\[cosmos, nebula, aurora\]/);
  });

  it('adds a chart layout', () => {
    const root = copyRepoFiles();
    apply(root, plan('chart', names('sparkline')));
    expect(readFileSync(join(root, 'packages/charts-core/src/index.ts'), 'utf8')).toContain(
      "from './sparkline-layout.js'"
    );
  });

  it('adds a native-only component', () => {
    const root = copyRepoFiles();
    const files = apply(root, plan('native', names('bottom-sheet')));
    expect(files).toContain('packages/native/src/components/bottom-sheet.tsx');
    expect(files.some(file => file.startsWith('packages/elements'))).toBe(false);
    expect(files).toContain('apps/docs/src/content/docs/components/bottom-sheet.mdx');
    const contract = plan('native', names('bottom-sheet')).find(op =>
      op.path.endsWith('specs/bottom-sheet.ts')
    );
    expect(contract?.content).toContain("platforms: ['native'],");
  });

  it('rejects unknown targets', () => {
    expect(() => plan('widget', names('chip'))).toThrow(/Unknown target/);
  });
});
