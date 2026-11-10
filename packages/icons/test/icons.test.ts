import { describe, expect, it } from 'vitest';
import { type IconDefinition, isIconDefinition } from '../src/index.js';

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
    ['invalid names', { ...valid, name: 'Bad Name' }],
  ])('rejects %s', (_, icon) => {
    expect(isIconDefinition(icon)).toBe(false);
  });
});
