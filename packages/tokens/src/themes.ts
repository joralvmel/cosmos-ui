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

/** Magenta-violet primary with a cyan accent (split-complementary), softer corners. */
export const nebula: ThemeDefinition = defineTheme({
  name: 'nebula',
  label: 'Nebula',
  seeds: { primary: 'oklch(0.56 0.21 318)', accent: 'oklch(0.7 0.13 205)' },
  harmony: 'split-complementary',
  neutral: { tint: 'primary', chroma: 0.014 },
  radius: 'soft',
});

/** Built-in themes, in display order. The first one is the default. */
export const builtInThemes: readonly ThemeDefinition[] = [cosmos, nebula];
export const defaultThemeName = cosmos.name;
