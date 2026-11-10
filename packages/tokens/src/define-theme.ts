import { parseColor } from './color.js';
import {
  type Harmony,
  type Mode,
  type ModeOverrides,
  type RadiusPreset,
  semanticColors,
  type ThemeDefinition,
  type ThemeInput,
} from './types.js';

const harmonies: readonly Harmony[] = [
  'monochrome',
  'analogous',
  'complementary',
  'split-complementary',
  'triadic',
  'tetradic',
];
const radii: readonly RadiusPreset[] = ['sharp', 'soft', 'rounded', 'pill'];
const forbiddenKeys = new Set(['__proto__', 'constructor', 'prototype']);
const namePattern = /^[a-z][a-z0-9-]{1,31}$/;
const reservedNames = new Set(['light', 'dark', 'system']);
const knownColors = new Set<string>(semanticColors);

function sanitizeOverrides(theme: string, mode: Mode, input: unknown): ModeOverrides {
  const result: ModeOverrides = Object.create(null);
  if (input === undefined) return result;
  if (typeof input !== 'object' || input === null) {
    throw new TypeError(`Theme "${theme}": modes.${mode} must be an object`);
  }
  for (const key of Object.keys(input)) {
    if (forbiddenKeys.has(key) || !knownColors.has(key)) {
      throw new TypeError(`Theme "${theme}": unknown token "${key}" in modes.${mode}`);
    }
    const value = (input as Record<string, unknown>)[key];
    if (typeof value !== 'string') {
      throw new TypeError(`Theme "${theme}": modes.${mode}.${key} must be a color string`);
    }
    parseColor(value);
    (result as Record<string, string>)[key] = value;
  }
  return result;
}

/**
 * Validates and normalizes a theme definition. Rejects unknown tokens, prototype keys,
 * invalid colors and invalid names so themes can safely come from configuration files.
 */
export function defineTheme(input: ThemeInput): ThemeDefinition {
  if (typeof input !== 'object' || input === null) throw new TypeError('Theme must be an object');
  const { name } = input;
  if (typeof name !== 'string' || !namePattern.test(name)) {
    throw new TypeError(
      `Invalid theme name "${String(name)}": use lowercase kebab-case (2-32 chars)`
    );
  }
  if (reservedNames.has(name)) {
    throw new TypeError(`Invalid theme name "${name}": light, dark and system are mode names`);
  }
  if (!input.seeds || typeof input.seeds.primary !== 'string') {
    throw new TypeError(`Theme "${name}": seeds.primary is required`);
  }
  parseColor(input.seeds.primary);
  if (input.seeds.accent !== undefined) parseColor(input.seeds.accent);

  const harmony = input.harmony ?? 'analogous';
  if (!harmonies.includes(harmony)) throw new TypeError(`Theme "${name}": unknown harmony`);
  const radius = input.radius ?? 'rounded';
  if (!radii.includes(radius)) throw new TypeError(`Theme "${name}": unknown radius preset`);

  const chroma = input.neutral?.chroma ?? 0.012;
  if (!(chroma >= 0 && chroma <= 0.05)) {
    throw new RangeError(`Theme "${name}": neutral.chroma must be between 0 and 0.05`);
  }

  return Object.freeze({
    name,
    label: input.label ?? name.charAt(0).toUpperCase() + name.slice(1),
    seeds: { primary: input.seeds.primary, accent: input.seeds.accent },
    harmony,
    neutral: { tint: input.neutral?.tint ?? 'primary', chroma },
    radius,
    modes: {
      light: sanitizeOverrides(name, 'light', input.modes?.light),
      dark: sanitizeOverrides(name, 'dark', input.modes?.dark),
    },
  });
}
