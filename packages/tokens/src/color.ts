import {
  type Color,
  clampChroma,
  converter,
  differenceCiede2000,
  filterDeficiencyDeuter,
  filterDeficiencyProt,
  filterDeficiencyTrit,
  formatHex,
  type Oklch,
  parse,
  type Rgb,
  wcagContrast,
} from 'culori';

const toOklch = converter('oklch');
const toRgb = converter('rgb');
const deltaE = differenceCiede2000();

/** Parses a color or throws; avoids `undefined` leaking into conversions. */
function mustParse(value: string): Color {
  const parsed = parse(value);
  if (!parsed) throw new TypeError(`Invalid color: "${value}"`);
  return parsed;
}

function rgbOf(value: string): Rgb {
  const rgb = toRgb(mustParse(value));
  if (!rgb) throw new TypeError(`Cannot convert "${value}" to sRGB`);
  return rgb;
}

export interface Lch {
  l: number;
  c: number;
  h: number;
  alpha?: number;
}

/** Parses any CSS color into OKLCH. Throws on invalid input. */
export function parseColor(value: string): Lch {
  const oklch = toOklch(mustParse(value));
  if (!oklch) throw new TypeError(`Invalid color: "${value}"`);
  const { l, c, h, alpha } = oklch;
  return { l, c, h: h ?? 0, ...(alpha === undefined ? {} : { alpha }) };
}

const round = (value: number, digits: number) => Number(value.toFixed(digits));

/** Maps an OKLCH color into the sRGB gamut (reducing chroma) and formats it as `oklch(...)`. */
export function formatOklch(color: Lch): string {
  const clamped = clampChroma({ mode: 'oklch', ...color } as Oklch, 'oklch') as Oklch;
  const l = round(clamped.l, 4);
  const c = round(clamped.c, 4);
  const h = round(clamped.h ?? 0, 2);
  const alpha = color.alpha === undefined || color.alpha >= 1 ? '' : ` / ${round(color.alpha, 3)}`;
  return `oklch(${l} ${c} ${h}${alpha})`;
}

/** sRGB hex (`#rrggbb`), used by React Native and JSON outputs. Alpha is dropped. */
export function toHex(color: string): string {
  return formatHex(mustParse(color)) ?? '#000000';
}

/** `rgba()` string that keeps alpha, used by React Native. */
export function toRgba(color: string): string {
  const rgb = rgbOf(color);
  const channel = (v: number) => Math.round(Math.min(1, Math.max(0, v)) * 255);
  return `rgba(${channel(rgb.r)}, ${channel(rgb.g)}, ${channel(rgb.b)}, ${round(rgb.alpha ?? 1, 3)})`;
}

/** WCAG 2.x contrast ratio (1–21). */
export function contrastRatio(foreground: string, background: string): number {
  return wcagContrast(foreground, background);
}

function apcaLuminance(color: string): number {
  const { r, g, b } = rgbOf(color);
  const lin = (v: number) => Math.max(0, v) ** 2.4;
  const y = 0.2126729 * lin(r) + 0.7151522 * lin(g) + 0.072175 * lin(b);
  // APCA soft-clamp exponent; it is a fixed constant of the algorithm, not √2.
  // biome-ignore lint/suspicious/noApproximativeNumericConstant: defined by APCA 0.0.98G
  return y < 0.022 ? y + (0.022 - y) ** 1.414 : y;
}

/**
 * APCA lightness contrast (Lc, roughly -108…106). Informative only: WCAG 2.2 ratios are the
 * normative check. Positive = dark text on light background.
 */
export function apcaContrast(text: string, background: string): number {
  const yText = apcaLuminance(text);
  const yBg = apcaLuminance(background);
  if (Math.abs(yBg - yText) < 0.0005) return 0;
  if (yBg > yText) {
    const sapc = (yBg ** 0.56 - yText ** 0.57) * 1.14;
    return sapc < 0.1 ? 0 : round((sapc - 0.027) * 100, 1);
  }
  const sapc = (yBg ** 0.65 - yText ** 0.62) * 1.14;
  return sapc > -0.1 ? 0 : round((sapc + 0.027) * 100, 1);
}

export type Deficiency = 'protanopia' | 'deuteranopia' | 'tritanopia';
const deficiencyFilters = {
  protanopia: filterDeficiencyProt(1),
  deuteranopia: filterDeficiencyDeuter(1),
  tritanopia: filterDeficiencyTrit(1),
} as const;

/** Simulates a color vision deficiency and returns the perceived color as hex. */
export function simulateDeficiency(color: string, deficiency: Deficiency): string {
  const simulated = deficiencyFilters[deficiency](mustParse(color));
  return formatHex(simulated) ?? '#000000';
}

/** CIEDE2000 perceptual distance between two colors (0 = identical, ~2.3 = just noticeable). */
export function colorDistance(a: string, b: string): number {
  return deltaE(mustParse(a), mustParse(b));
}
