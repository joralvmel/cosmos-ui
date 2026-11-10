import { seriesColorToken } from '@joralvmel/cosmos-charts-core';
import type { NativeTheme } from '@joralvmel/cosmos-tokens/native';

export { linearScale, niceDomain, ticks } from '@joralvmel/cosmos-charts-core';

/** Color of a series for `react-native-svg`, taken from the active Cosmos theme. */
export function seriesColor(theme: Pick<NativeTheme, 'colors'>, index: number): string {
  return theme.colors[seriesColorToken(index) as keyof NativeTheme['colors']];
}
