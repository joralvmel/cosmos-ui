import {
  apcaContrast,
  colorDistance,
  contrastRatio,
  type Deficiency,
  simulateDeficiency,
} from './color.js';
import { intents, type Mode, type ResolvedTheme, type SemanticColor } from './types.js';

export interface ContrastCheck {
  mode: Mode;
  foreground: SemanticColor;
  background: SemanticColor;
  ratio: number;
  minimum: number;
  apca: number;
  pass: boolean;
}

export interface DeficiencyCheck {
  mode: Mode;
  deficiency: Deficiency;
  pair: [SemanticColor, SemanticColor];
  distance: number;
  minimum: number;
  pass: boolean;
}

export interface ThemeReport {
  theme: string;
  pass: boolean;
  contrast: ContrastCheck[];
  deficiencies: DeficiencyCheck[];
}

/** WCAG 2.2 AA: 4.5:1 for text, 3:1 for UI components, focus indicators and graphics. */
const TEXT = 4.5;
const UI = 3;

const contrastPairs: [SemanticColor, SemanticColor, number][] = [
  ['fg', 'bg', TEXT],
  ['fg', 'surface', TEXT],
  ['fg', 'surface-raised', TEXT],
  ['fg-muted', 'bg', TEXT],
  ['fg-muted', 'surface', TEXT],
  ['border-strong', 'bg', UI],
  ['border-strong', 'surface', UI],
  ['focus-ring', 'bg', UI],
  ['focus-ring', 'surface', UI],
  ['primary-fg', 'primary', TEXT],
  ['primary-fg', 'primary-hover', TEXT],
  ['primary-text', 'bg', TEXT],
  ['primary-text', 'primary-subtle', TEXT],
  ['primary', 'bg', UI],
  ['accent-fg', 'accent', TEXT],
  ['accent-fg', 'accent-hover', TEXT],
  ['accent-text', 'bg', TEXT],
  ['accent-text', 'accent-subtle', TEXT],
  ...intents.flatMap(
    intent =>
      [
        [`${intent}-fg`, intent, TEXT],
        [`${intent}-text`, 'bg', TEXT],
        [`${intent}-text`, `${intent}-subtle`, TEXT],
        // Warning is a light fill with dark text by design; its text color carries the contrast.
        ...(intent === 'warning' ? [] : [[intent, 'bg', UI]]),
      ] as [SemanticColor, SemanticColor, number][]
  ),
  ...Array.from(
    { length: 8 },
    (_, i) => [`chart-${i + 1}`, 'bg', UI] as [SemanticColor, SemanticColor, number]
  ),
];

/** Pairs that must stay distinguishable for people with color vision deficiencies. */
const distinguishablePairs: [SemanticColor, SemanticColor][] = [
  ['success', 'danger'],
  ['warning', 'danger'],
  ['info', 'success'],
  ...Array.from(
    { length: 7 },
    (_, i) => [`chart-${i + 1}`, `chart-${i + 2}`] as [SemanticColor, SemanticColor]
  ),
];
/** CIEDE2000 distance; ~10 is clearly distinguishable side by side. */
const MIN_DISTANCE = 10;
const deficiencyKinds: Deficiency[] = ['protanopia', 'deuteranopia', 'tritanopia'];

/**
 * Validates a resolved theme: WCAG 2.2 AA contrast (normative), APCA Lc (informative) and
 * distinguishability of status and chart colors under simulated color vision deficiencies.
 */
export function validateTheme(theme: ResolvedTheme): ThemeReport {
  const contrast: ContrastCheck[] = [];
  const deficiencies: DeficiencyCheck[] = [];
  for (const mode of ['light', 'dark'] as const) {
    const { colors } = theme.modes[mode];
    for (const [foreground, background, minimum] of contrastPairs) {
      const ratio = Number(contrastRatio(colors[foreground], colors[background]).toFixed(2));
      contrast.push({
        mode,
        foreground,
        background,
        ratio,
        minimum,
        apca: apcaContrast(colors[foreground], colors[background]),
        pass: ratio >= minimum,
      });
    }
    for (const deficiency of deficiencyKinds) {
      for (const pair of distinguishablePairs) {
        const distance = Number(
          colorDistance(
            simulateDeficiency(colors[pair[0]], deficiency),
            simulateDeficiency(colors[pair[1]], deficiency)
          ).toFixed(2)
        );
        deficiencies.push({
          mode,
          deficiency,
          pair,
          distance,
          minimum: MIN_DISTANCE,
          pass: distance >= MIN_DISTANCE,
        });
      }
    }
  }
  return {
    theme: theme.definition.name,
    pass: contrast.every(check => check.pass) && deficiencies.every(check => check.pass),
    contrast,
    deficiencies,
  };
}
