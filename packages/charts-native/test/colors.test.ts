import { getNativeTheme } from '@joralvmel/cosmos-tokens/native';
import { describe, expect, it } from 'vitest';
import { seriesColor } from '../src/index.js';

describe('seriesColor', () => {
  it('reads the chart palette of the theme', () => {
    const theme = getNativeTheme('cosmos', 'dark');
    expect(seriesColor(theme, 2)).toBe(theme.colors['chart-3']);
  });
});
