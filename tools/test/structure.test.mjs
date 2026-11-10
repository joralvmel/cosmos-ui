import { catalog } from '@joralvmel/cosmos-core';
import { describe, expect, it } from 'vitest';
import { checkAnatomy, checkOrder } from '../status/anatomy.mjs';
import { getStatusReport, ROOT } from '../status/component-status.mjs';

const implemented = getStatusReport().components.filter(item => item.status !== 'planned');

describe('component anatomy (docs/conventions/component-anatomy.md)', () => {
  it('has at least one implemented component to check', () => {
    expect(implemented.length).toBeGreaterThan(0);
  });

  it.each(implemented.map(item => [item.name, item.platforms]))(
    '%s follows the anatomy',
    (name, platforms) => {
      expect(checkAnatomy(ROOT, name, platforms)).toEqual([]);
    }
  );

  it('reports missing and misplaced markers', () => {
    const markers = [
      { label: 'a', pattern: /^a$/m },
      { label: 'b', pattern: /^b$/m },
      { label: 'c', pattern: /^c$/m, optional: true },
    ];
    expect(checkOrder('f', 'a\nb', markers)).toEqual([]);
    expect(checkOrder('f', 'b\na', markers)).toEqual(['f: b must come after a']);
    expect(checkOrder('f', 'a', markers)).toEqual(['f: missing b']);
  });

  it('only checks catalog entries', () => {
    const names = new Set(catalog.map(item => item.name));
    for (const item of implemented) expect(names).toContain(item.name);
  });
});
