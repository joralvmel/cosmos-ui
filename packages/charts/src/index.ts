import { seriesColorToken } from '@joralvmel/cosmos-charts-core';

export { linearScale, niceDomain, seriesColorToken, ticks } from '@joralvmel/cosmos-charts-core';

/** CSS color of a series for SVG `fill`/`stroke`, themed through `--cosm-chart-*`. */
export function seriesColor(index: number): string {
  return `var(--cosm-${seriesColorToken(index)})`;
}
