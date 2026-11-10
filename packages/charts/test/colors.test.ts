import { describe, expect, it } from 'vitest';
import { seriesColor } from '../src/index.js';

describe('seriesColor', () => {
  it('returns themed CSS variables', () => {
    expect(seriesColor(1)).toBe('var(--cosm-chart-2)');
  });
});
