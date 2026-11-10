import { describe, expect, it } from 'vitest';
import { buildOrder, catalog, catalogEntry, contracts } from '../src/index.js';

describe('catalog', () => {
  it('has unique kebab-case names', () => {
    const names = catalog.map(item => item.name);
    expect(new Set(names).size).toBe(names.length);
    for (const name of names) expect(name).toMatch(/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/);
  });

  it('only depends on catalog entries, without cycles', () => {
    const order = buildOrder();
    expect(order).toHaveLength(catalog.length);
    for (const item of catalog) {
      for (const dep of item.dependsOn) {
        expect(order.indexOf(dep), `${dep} before ${item.name}`).toBeLessThan(
          order.indexOf(item.name)
        );
      }
    }
  });

  it('detects unknown dependencies and cycles', () => {
    const base = catalog[0];
    if (!base) throw new Error('empty catalog');
    expect(() => buildOrder([{ ...base, name: 'a', dependsOn: ['missing'] }])).toThrow(/Unknown/);
    expect(() =>
      buildOrder([
        { ...base, name: 'a', dependsOn: ['b'] },
        { ...base, name: 'b', dependsOn: ['a'] },
      ])
    ).toThrow(/Cycle/);
  });

  it('contains the minimum base of the library', () => {
    const base = catalog.filter(item => item.priority === 1).map(item => item.name);
    for (const name of [
      'button',
      'icon',
      'text-field',
      'textarea',
      'checkbox',
      'radio-group',
      'switch',
      'select',
      'combobox',
      'multi-select',
      'tooltip',
      'popover',
      'dialog',
      'toast',
      'tabs',
      'accordion',
      'card',
      'badge',
      'avatar',
      'divider',
      'pagination',
      'table',
      'date-picker',
    ]) {
      expect(base).toContain(name);
    }
  });

  it('lists every contract', () => {
    for (const name of Object.keys(contracts)) expect(catalogEntry(name), name).toBeDefined();
  });
});
