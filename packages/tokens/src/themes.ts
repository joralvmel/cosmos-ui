import { defineTheme } from './define-theme.js';
import type { ThemeDefinition } from './types.js';

/** Default theme: deep indigo with a violet accent, neutral greys with a faint cool tint. */
export const cosmos: ThemeDefinition = defineTheme({
  name: 'cosmos',
  label: 'Cosmos',
  seeds: { primary: 'oklch(0.55 0.2 268)' },
  harmony: 'analogous',
  neutral: { tint: 'primary', chroma: 0.01 },
  radius: 'rounded',
});

/** Magenta-violet primary with a cyan accent (split-complementary). */
export const nebula: ThemeDefinition = defineTheme({
  name: 'nebula',
  label: 'Nebula',
  seeds: { primary: 'oklch(0.56 0.21 318)', accent: 'oklch(0.7 0.13 205)' },
  harmony: 'split-complementary',
  neutral: { tint: 'primary', chroma: 0.014 },
  radius: 'rounded',
});

/** Terra pairs a leafy green brand with a fresh analogous accent and discreet green-tinted surfaces. */
export const terra: ThemeDefinition = defineTheme({
  name: 'terra',
  label: 'Terra',
  seeds: { primary: 'oklch(0.56 0.16 145)' },
  harmony: 'analogous',
  neutral: { tint: 'primary', chroma: 0.008 },
  radius: 'rounded',
});

/** Supernova uses a coral-red brand, a warm neighboring accent and restrained warm-neutral surfaces. */
export const supernova: ThemeDefinition = defineTheme({
  name: 'supernova',
  label: 'Supernova',
  seeds: { primary: 'oklch(0.60 0.19 28)' },
  harmony: 'analogous',
  neutral: { tint: 'primary', chroma: 0.008 },
  radius: 'rounded',
});

/** Aurora centers a clear cyan-turquoise brand with a cool analogous accent and quiet surfaces. */
export const aurora: ThemeDefinition = defineTheme({
  name: 'aurora',
  label: 'Aurora',
  seeds: { primary: 'oklch(0.60 0.14 190)' },
  harmony: 'analogous',
  neutral: { tint: 'primary', chroma: 0.008 },
  radius: 'rounded',
});

/** Solstice brings a sunlit amber-gold brand to subtle warm-neutral surfaces with a harmonious accent. */
export const solstice: ThemeDefinition = defineTheme({
  name: 'solstice',
  label: 'Solstice',
  seeds: { primary: 'oklch(0.68 0.16 82)' },
  harmony: 'analogous',
  neutral: { tint: 'primary', chroma: 0.008 },
  radius: 'rounded',
});

/** Built-in themes, in display order. The first one is the default. */
export const builtInThemes: readonly ThemeDefinition[] = [
  cosmos,
  nebula,
  terra,
  supernova,
  aurora,
  solstice,
];
export const defaultThemeName = cosmos.name;
