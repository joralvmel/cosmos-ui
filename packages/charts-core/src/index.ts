export interface LinearScale {
  (value: number): number;
  domain: readonly [number, number];
  range: readonly [number, number];
  invert(position: number): number;
}

/** Maps a numeric domain to a range. A zero-width domain maps to the middle of the range. */
export function linearScale(
  domain: readonly [number, number],
  range: readonly [number, number]
): LinearScale {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0;
  const scale = ((value: number) =>
    span === 0 ? (r0 + r1) / 2 : r0 + ((value - d0) / span) * (r1 - r0)) as LinearScale;
  scale.domain = domain;
  scale.range = range;
  scale.invert = position => (r1 === r0 ? d0 : d0 + ((position - r0) / (r1 - r0)) * span);
  return scale;
}

/** Extends a domain to round tick boundaries (1, 2 or 5 × 10ⁿ steps). */
export function niceDomain(min: number, max: number, count = 5): [number, number] {
  if (min === max) return [min, max];
  const step = tickStep(min, max, count);
  return [Math.floor(min / step) * step, Math.ceil(max / step) * step];
}

function tickStep(min: number, max: number, count: number): number {
  const raw = Math.abs(max - min) / Math.max(1, count);
  const power = 10 ** Math.floor(Math.log10(raw));
  const ratio = raw / power;
  return (ratio >= 7 ? 10 : ratio >= 3 ? 5 : ratio >= 1.5 ? 2 : 1) * power;
}

/** Round tick values covering `[min, max]`. */
export function ticks(min: number, max: number, count = 5): number[] {
  if (min === max) return [min];
  const step = tickStep(min, max, count);
  const start = Math.ceil(min / step);
  const end = Math.floor(max / step);
  return Array.from({ length: end - start + 1 }, (_, i) =>
    Number(((start + i) * step).toPrecision(12))
  );
}

/** Number of categorical colors provided by every theme (`--cosm-chart-1` … `--cosm-chart-8`). */
export const SERIES_COLORS = 8;

/** Token name of the color of a series, cycling through the categorical palette. */
export function seriesColorToken(index: number): `chart-${number}` {
  return `chart-${(((index % SERIES_COLORS) + SERIES_COLORS) % SERIES_COLORS) + 1}`;
}
