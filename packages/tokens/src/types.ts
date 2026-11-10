/** Color modes every theme provides. `system` is resolved at runtime from `prefers-color-scheme`. */
export type Mode = 'light' | 'dark';
export type ModePreference = Mode | 'system';

/** How the accent hue is derived from the primary seed when no accent seed is given. */
export type Harmony =
  | 'monochrome'
  | 'analogous'
  | 'complementary'
  | 'split-complementary'
  | 'triadic'
  | 'tetradic';

export type RadiusPreset = 'sharp' | 'soft' | 'rounded' | 'pill';

export const intents = ['success', 'warning', 'danger', 'info'] as const;
export type Intent = (typeof intents)[number];

/** Semantic color tokens shared by every theme (`--cosm-<name>`). */
export const semanticColors = [
  'bg',
  'surface',
  'surface-raised',
  'fg',
  'fg-muted',
  'border',
  'border-strong',
  'primary',
  'primary-hover',
  'primary-fg',
  'primary-subtle',
  'primary-text',
  'accent',
  'accent-hover',
  'accent-fg',
  'accent-subtle',
  'accent-text',
  ...intents.flatMap(
    intent => [intent, `${intent}-fg`, `${intent}-subtle`, `${intent}-text`] as const
  ),
  'focus-ring',
  'overlay',
  'chart-1',
  'chart-2',
  'chart-3',
  'chart-4',
  'chart-5',
  'chart-6',
  'chart-7',
  'chart-8',
] as const;
export type SemanticColor = (typeof semanticColors)[number];

export type ModeOverrides = Partial<Record<SemanticColor, string>>;

/** Input accepted by `defineTheme`. Seeds are any CSS color; OKLCH is recommended. */
export interface ThemeInput {
  name: string;
  label?: string;
  seeds: { primary: string; accent?: string };
  harmony?: Harmony;
  neutral?: { tint?: 'primary' | 'accent' | 'none'; chroma?: number };
  radius?: RadiusPreset;
  modes?: Partial<Record<Mode, ModeOverrides>>;
}

/** Normalized, validated theme definition. */
export interface ThemeDefinition {
  name: string;
  label: string;
  seeds: { primary: string; accent: string | undefined };
  harmony: Harmony;
  neutral: { tint: 'primary' | 'accent' | 'none'; chroma: number };
  radius: RadiusPreset;
  modes: Record<Mode, ModeOverrides>;
}

/** 12-step perceptual scale: index 0 = step 1 (app background) … index 11 = step 12 (high-contrast text). */
export type Scale = readonly string[];

export interface ResolvedMode {
  colors: Record<SemanticColor, string>;
  scales: Record<'neutral' | 'primary' | 'accent' | Intent, Scale>;
  shadows: Record<'sm' | 'md' | 'lg', string>;
}

export interface ResolvedTheme {
  definition: ThemeDefinition;
  radius: Record<'sm' | 'md' | 'lg' | 'xl' | 'full', string>;
  modes: Record<Mode, ResolvedMode>;
}
