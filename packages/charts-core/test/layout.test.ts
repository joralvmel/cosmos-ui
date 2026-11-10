import { describe, expect, it } from 'vitest';
import { linearScale, niceDomain, seriesColorToken, ticks } from '../src/index.js';

describe('linearScale', () => {
  it('maps and inverts values', () => {
    const scale = linearScale([0, 10], [0, 200]);
    expect(scale(5)).toBe(100);
    expect(scale.invert(50)).toBe(2.5);
  });

  it('handles inverted ranges and empty domains', () => {
    expect(linearScale([0, 10], [100, 0])(10)).toBe(0);
    expect(linearScale([3, 3], [0, 100])(3)).toBe(50);
  });
});

describe('ticks', () => {
  it('produces round steps', () => {
    expect(ticks(0, 10)).toEqual([0, 2, 4, 6, 8, 10]);
    expect(ticks(0, 1, 4)).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1]);
    expect(niceDomain(3, 97)).toEqual([0, 100]);
  });
});

describe('seriesColorToken', () => {
  it('cycles through the categorical palette', () => {
    expect(seriesColorToken(0)).toBe('chart-1');
    expect(seriesColorToken(8)).toBe('chart-1');
    expect(seriesColorToken(-1)).toBe('chart-8');
  });
});
