import { formatOklch, type Lch } from './color.js';
import type { Harmony, Mode, Scale } from './types.js';

/**
 * Lightness curves for the 12 steps. Dark mode has its own curve (it is not an inversion):
 * backgrounds stay deep, solids (step 9) are lifted so dark text can sit on them.
 *  1-2 backgrounds · 3-5 component fills · 6-8 borders · 9-10 solids · 11-12 text.
 */
const lightness: Record<Mode, readonly number[]> = {
  light: [0.985, 0.97, 0.945, 0.915, 0.885, 0.85, 0.79, 0.64, 0.55, 0.5, 0.44, 0.24],
  dark: [0.16, 0.19, 0.23, 0.26, 0.3, 0.34, 0.4, 0.52, 0.66, 0.71, 0.8, 0.95],
};

/** Share of the seed chroma used per step; dark mode is slightly desaturated to avoid glare. */
const chromaCurve: Record<Mode, readonly number[]> = {
  light: [0.08, 0.14, 0.24, 0.34, 0.44, 0.54, 0.64, 0.8, 1, 1, 0.9, 0.55],
  dark: [0.15, 0.2, 0.3, 0.4, 0.48, 0.56, 0.66, 0.8, 0.92, 0.88, 0.7, 0.35],
};

/**
 * Builds a 12-step scale for a hue and peak chroma. Values are gamut-mapped to sRGB.
 * `solidShift` moves the solid steps (9-10) lighter or darker so that status colors also differ
 * in lightness, which keeps them distinguishable for people with color vision deficiencies.
 */
export function createScale(hue: number, chroma: number, mode: Mode, solidShift = 0): Scale {
  const ls = lightness[mode];
  const cs = chromaCurve[mode];
  return ls.map((l, index) =>
    formatOklch({
      l: index === 8 || index === 9 ? l + solidShift : l,
      c: chroma * (cs[index] ?? 1),
      h: hue,
    })
  );
}

/**
 * Solid lightness shift per status color, chosen so status colors also differ in lightness and
 * stay distinguishable under protanopia, deuteranopia and tritanopia for any primary seed.
 * Warning is a light solid with dark text in both modes. Under protanopia red looks darker, so in
 * light mode danger and info are darker than success; in dark mode success is the lightest.
 */
export const intentSolidShift: Record<
  Mode,
  Record<'success' | 'warning' | 'danger' | 'info', number>
> = {
  light: { success: 0, warning: 0.25, danger: -0.1, info: -0.1 },
  dark: { success: 0.1, warning: 0.15, danger: -0.02, info: -0.03 },
};

/** Neutral scale tinted towards a hue with a very small, constant chroma. */
export function createNeutralScale(hue: number, chroma: number, mode: Mode): Scale {
  return lightness[mode].map(l => formatOklch({ l, c: chroma, h: hue }));
}

const harmonyOffset: Record<Harmony, number> = {
  monochrome: 0,
  analogous: 35,
  complementary: 180,
  'split-complementary': 150,
  triadic: 120,
  tetradic: 90,
};

const normalizeHue = (hue: number) => ((hue % 360) + 360) % 360;

/** Accent hue derived from the primary seed according to the color harmony. */
export function harmonyHue(primary: Lch, harmony: Harmony): number {
  return normalizeHue(primary.h + harmonyOffset[harmony]);
}

/** Recognizable hues for status colors (green-teal, amber, red, blue). */
const intentHues = { success: 160, warning: 70, danger: 27, info: 255 } as const;

/** Maximum hue nudge towards the primary; small so status colors keep CVD-safe distances. */
const MAX_INTENT_NUDGE = 3;

/**
 * Status hue nudged slightly towards the primary hue so it harmonizes with the theme without
 * losing its meaning or its distinguishability.
 */
export function intentHue(intent: keyof typeof intentHues, primaryHue: number): number {
  const base = intentHues[intent];
  const delta = ((primaryHue - base + 540) % 360) - 180;
  const shift = Math.max(-MAX_INTENT_NUDGE, Math.min(MAX_INTENT_NUDGE, delta * 0.1));
  return normalizeHue(base + shift);
}

/** Categorical chart palette: 8 hues 135° apart with alternating lightness for adjacent series. */
export function chartPalette(primaryHue: number, mode: Mode): string[] {
  const levels = mode === 'light' ? [0.4, 0.64] : [0.86, 0.66];
  const chroma = mode === 'light' ? 0.14 : 0.16;
  return Array.from({ length: 8 }, (_, index) =>
    formatOklch({
      l: levels[index % 2] ?? 0.6,
      c: chroma,
      h: normalizeHue(primaryHue + index * 135),
    })
  );
}
