import { contrastRatio, formatOklch, parseColor } from './color.js';
import {
  chartPalette,
  createNeutralScale,
  createScale,
  harmonyHue,
  intentHue,
  intentSolidShift,
} from './scale.js';
import {
  type Intent,
  intents,
  type Mode,
  type RadiusPreset,
  type ResolvedMode,
  type ResolvedTheme,
  type Scale,
  type SemanticColor,
  type ThemeDefinition,
} from './types.js';

const radiusPresets: Record<RadiusPreset, ResolvedTheme['radius']> = {
  sharp: { sm: '0', md: '0', lg: '0', xl: '0', full: '9999px' },
  soft: { sm: '0.125rem', md: '0.25rem', lg: '0.375rem', xl: '0.5rem', full: '9999px' },
  rounded: { sm: '0.25rem', md: '0.5rem', lg: '0.75rem', xl: '1rem', full: '9999px' },
  pill: { sm: '0.375rem', md: '0.75rem', lg: '1rem', xl: '1.5rem', full: '9999px' },
};

const step = (scale: Scale, n: number) => scale[n - 1] ?? 'black';

/** Picks the text color with the higher contrast on a solid background. */
function onColor(solid: string, light: string, dark: string): string {
  return contrastRatio(light, solid) >= contrastRatio(dark, solid) ? light : dark;
}

function resolveMode(definition: ThemeDefinition, mode: Mode): ResolvedMode {
  const primarySeed = parseColor(definition.seeds.primary);
  const accentSeed = definition.seeds.accent
    ? parseColor(definition.seeds.accent)
    : {
        l: primarySeed.l,
        c: definition.harmony === 'monochrome' ? primarySeed.c * 0.6 : primarySeed.c,
        h: harmonyHue(primarySeed, definition.harmony),
      };
  const tintHue =
    definition.neutral.tint === 'accent'
      ? accentSeed.h
      : definition.neutral.tint === 'none'
        ? 0
        : primarySeed.h;
  const neutralChroma = definition.neutral.tint === 'none' ? 0 : definition.neutral.chroma;
  const chroma = (c: number) => Math.min(Math.max(c, 0.04), 0.25);

  const neutral = createNeutralScale(tintHue, neutralChroma, mode);
  const primary = createScale(primarySeed.h, chroma(primarySeed.c), mode);
  const accent = createScale(accentSeed.h, chroma(accentSeed.c), mode);
  const intentScales = Object.fromEntries(
    intents.map(intent => [
      intent,
      createScale(intentHue(intent, primarySeed.h), 0.16, mode, intentSolidShift[mode][intent]),
    ])
  ) as Record<Intent, Scale>;

  const white = formatOklch({ l: 1, c: 0, h: 0 });
  const lightText = mode === 'light' ? white : step(neutral, 12);
  const darkText = mode === 'light' ? step(neutral, 12) : step(neutral, 1);
  const solidStep = 9;
  const hoverStep = 10;

  const colors = {
    bg: step(neutral, 1),
    surface: mode === 'light' ? white : step(neutral, 2),
    'surface-raised': mode === 'light' ? white : step(neutral, 3),
    fg: step(neutral, 12),
    'fg-muted': step(neutral, 11),
    border: step(neutral, 6),
    'border-strong': step(neutral, 8),
    'focus-ring': mode === 'light' ? step(primary, 9) : step(primary, 10),
    overlay:
      mode === 'light'
        ? formatOklch({ l: 0.2, c: 0.02, h: tintHue, alpha: 0.5 })
        : formatOklch({ l: 0, c: 0, h: 0, alpha: 0.65 }),
  } as Record<SemanticColor, string>;

  const solids: [string, Scale][] = [
    ['primary', primary],
    ['accent', accent],
    ...intents.map(intent => [intent, intentScales[intent]] as [string, Scale]),
  ];
  for (const [name, scale] of solids) {
    const solid = step(scale, solidStep);
    const record = colors as Record<string, string>;
    record[name] = solid;
    record[`${name}-fg`] = onColor(solid, lightText, darkText);
    record[`${name}-subtle`] = step(scale, 3);
    record[`${name}-text`] = step(scale, 11);
    if (name === 'primary' || name === 'accent') record[`${name}-hover`] = step(scale, hoverStep);
  }
  chartPalette(primarySeed.h, mode).forEach((color, index) => {
    (colors as Record<string, string>)[`chart-${index + 1}`] = color;
  });

  Object.assign(colors, definition.modes[mode]);

  const shadowColor =
    mode === 'light'
      ? (alpha: number) => formatOklch({ l: 0.2, c: 0.02, h: tintHue, alpha })
      : (alpha: number) => formatOklch({ l: 0, c: 0, h: 0, alpha: alpha * 3 });
  const shadows = {
    sm: `0 1px 2px ${shadowColor(0.08)}`,
    md: `0 2px 4px ${shadowColor(0.06)}, 0 4px 12px ${shadowColor(0.1)}`,
    lg: `0 4px 8px ${shadowColor(0.06)}, 0 12px 32px ${shadowColor(0.14)}`,
  };

  return { colors, scales: { neutral, primary, accent, ...intentScales }, shadows };
}

/** Generates every token value of a theme for both modes. */
export function resolveTheme(definition: ThemeDefinition): ResolvedTheme {
  return {
    definition,
    radius: radiusPresets[definition.radius],
    modes: { light: resolveMode(definition, 'light'), dark: resolveMode(definition, 'dark') },
  };
}
