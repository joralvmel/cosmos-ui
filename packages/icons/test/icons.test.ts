import { describe, expect, it } from 'vitest';
import {
  type IconDefinition,
  iconCatalog,
  isIconDefinition,
  lucideVersion,
  searchIconCatalog,
} from '../src/index.js';
import { house } from '../src/lucide/house.js';

const valid: IconDefinition = {
  name: 'dot',
  viewBox: '0 0 24 24',
  nodes: [['circle', { cx: 12, cy: 12, r: 4 }]],
};

describe('isIconDefinition', () => {
  it('accepts structured icons', () => {
    expect(isIconDefinition(valid)).toBe(true);
  });

  it.each([
    ['unknown tags', { ...valid, nodes: [['script', {}]] }],
    ['event handlers', { ...valid, nodes: [['path', { onclick: 'x' }]] }],
    ['javascript urls', { ...valid, nodes: [['path', { d: 'javascript:alert(1)' }]] }],
    [
      'escaped paint URLs',
      { ...valid, nodes: [['path', { fill: 'u\\72l(https://example.com/a)' }]] },
    ],
    ['invalid names', { ...valid, name: 'Bad Name' }],
    ['unknown SVG attributes', { ...valid, nodes: [['path', { style: 'display:none' }]] }],
    ['invalid view boxes', { ...valid, viewBox: '0 0 NaN 24' }],
  ])('rejects %s', (_, icon) => {
    expect(isIconDefinition(icon)).toBe(false);
  });
});

describe('Lucide data', () => {
  it('ships a versioned metadata catalog with tags and categories', () => {
    expect(lucideVersion).toBe('1.72.0');
    expect(iconCatalog.length).toBeGreaterThan(2000);
    expect(iconCatalog.find(icon => icon.name === 'house')).toMatchObject({
      category: 'navigation',
      tags: expect.arrayContaining(['house', 'home']),
    });
  });

  it('exports a valid icon from its own tree-shakeable module', () => {
    expect(house.name).toBe('house');
    expect(isIconDefinition(house)).toBe(true);
  });

  it.each(['heart', 'star'])(
    'ranks the exact %s among the first ten real catalog results',
    name => {
      const matches = searchIconCatalog(iconCatalog, ` ${name.toUpperCase()} `);
      expect(matches.length).toBeGreaterThan(10);
      expect(matches[0]?.name).toBe(name);
      expect(matches.slice(0, 10).map(item => item.name)).toContain(name);
      const firstOther = matches.findIndex(item => !item.name.startsWith(name));
      if (firstOther !== -1)
        expect(matches.slice(1, firstOther).every(item => item.name.startsWith(name))).toBe(true);
    }
  );

  it('searches categories and tags, preserving catalog order for an empty query', () => {
    expect(searchIconCatalog(iconCatalog, '')).toEqual(iconCatalog);
    expect(searchIconCatalog(iconCatalog, 'home').some(item => item.name === 'house')).toBe(true);
    expect(searchIconCatalog(iconCatalog, 'navigation').some(item => item.name === 'house')).toBe(
      true
    );
  });
});
