import { baseTokens } from './base.js';
import { toHex, toRgba } from './color.js';
import { type Mode, type ResolvedTheme, type SemanticColor, semanticColors } from './types.js';

const PREFIX = '--cosm';

function flattenBase(): [string, string][] {
  const entries: [string, string][] = [];
  for (const [group, values] of Object.entries(baseTokens)) {
    if (group === 'breakpoint') continue;
    for (const [key, value] of Object.entries(values)) {
      entries.push([`${PREFIX}-${group}-${key}`, value]);
    }
  }
  return entries;
}

const declarations = (entries: [string, string][], indent = '  ') =>
  entries.map(([name, value]) => `${indent}${name}: ${value};`).join('\n');

function modeEntries(theme: ResolvedTheme, mode: Mode): [string, string][] {
  const resolved = theme.modes[mode];
  const entries: [string, string][] = [['color-scheme', mode]];
  for (const name of semanticColors) entries.push([`${PREFIX}-${name}`, resolved.colors[name]]);
  for (const [scale, values] of Object.entries(resolved.scales)) {
    values.forEach((value, index) => {
      entries.push([`${PREFIX}-${scale}-${index + 1}`, value]);
    });
  }
  for (const [size, value] of Object.entries(resolved.shadows)) {
    entries.push([`${PREFIX}-shadow-${size}`, value]);
  }
  return entries;
}

/**
 * CSS custom properties for all themes. Usage: `<html data-theme="nebula" data-mode="dark">`.
 * `data-mode="system"` follows `prefers-color-scheme`; a missing `data-mode` means light.
 * The first theme is also applied when no `data-theme` is set.
 */
export function toCss(themes: readonly ResolvedTheme[]): string {
  const blocks = [`:root {\n${declarations(flattenBase())}\n}`];
  themes.forEach((theme, index) => {
    const name = theme.definition.name;
    const scopes = [`[data-theme="${name}"]`, ...(index === 0 ? [':root:not([data-theme])'] : [])];
    const radius = Object.entries(theme.radius).map(
      ([size, value]) => [`${PREFIX}-radius-${size}`, value] as [string, string]
    );
    blocks.push(
      `${scopes.join(',\n')} {\n${declarations([...radius, ...modeEntries(theme, 'light')])}\n}`
    );
    const dark = declarations(modeEntries(theme, 'dark'));
    blocks.push(`${scopes.map(scope => `${scope}[data-mode="dark"]`).join(',\n')} {\n${dark}\n}`);
    const system = scopes.map(scope => `  ${scope}[data-mode="system"]`).join(',\n');
    blocks.push(
      `@media (prefers-color-scheme: dark) {\n${system} {\n${declarations(modeEntries(theme, 'dark'), '    ')}\n  }\n}`
    );
  });
  return `/* Cosmos UI tokens. Generated file, do not edit. */\n${blocks.join('\n\n')}\n`;
}

/**
 * Tailwind CSS v4 theme mapping utilities to Cosmos tokens (`bg-primary`, `text-fg-muted`,
 * `rounded-md`, `shadow-lg`, `p-4`…). Default Tailwind colors are removed so only tokens are used.
 */
export function toTailwindTheme(themes: readonly ResolvedTheme[]): string {
  const sample = themes[0];
  if (!sample) throw new Error('At least one theme is required');
  const lines: string[] = [
    '  --color-*: initial;',
    '  --color-white: #fff;',
    '  --color-black: #000;',
  ];
  lines.push('  --color-transparent: transparent;', '  --color-current: currentColor;');
  for (const name of semanticColors) lines.push(`  --color-${name}: var(${PREFIX}-${name});`);
  for (const [scale, values] of Object.entries(sample.modes.light.scales)) {
    values.forEach((_, index) => {
      lines.push(`  --color-${scale}-${index + 1}: var(${PREFIX}-${scale}-${index + 1});`);
    });
  }
  lines.push(`  --spacing: var(${PREFIX}-space-unit);`);
  for (const key of Object.keys(baseTokens.space)) {
    if (key !== 'unit') lines.push(`  --spacing-${key}: var(${PREFIX}-space-${key});`);
  }
  lines.push(
    `  --font-sans: var(${PREFIX}-font-sans);`,
    `  --font-mono: var(${PREFIX}-font-mono);`
  );
  for (const key of Object.keys(baseTokens.text)) {
    lines.push(`  --text-${key}: var(${PREFIX}-text-${key});`);
  }
  for (const key of Object.keys(baseTokens.leading)) {
    lines.push(`  --leading-${key}: var(${PREFIX}-leading-${key});`);
  }
  for (const key of Object.keys(baseTokens.weight)) {
    lines.push(`  --font-weight-${key}: var(${PREFIX}-weight-${key});`);
  }
  lines.push('  --radius-*: initial;');
  for (const key of Object.keys(sample.radius)) {
    lines.push(`  --radius-${key}: var(${PREFIX}-radius-${key});`);
  }
  lines.push('  --shadow-*: initial;');
  for (const key of Object.keys(sample.modes.light.shadows)) {
    lines.push(`  --shadow-${key}: var(${PREFIX}-shadow-${key});`);
  }
  for (const key of Object.keys(baseTokens.easing)) {
    lines.push(`  --ease-${key}: var(${PREFIX}-easing-${key});`);
  }
  lines.push('  --breakpoint-*: initial;');
  for (const [key, value] of Object.entries(baseTokens.breakpoint)) {
    lines.push(`  --breakpoint-${key}: ${value};`);
  }
  return `@theme inline {\n${lines.join('\n')}\n}\n`;
}

/** Tailwind v4 variants: `dark:` follows `data-mode` (including `system`), `theme-<name>:` per theme. */
export function toTailwindVariants(themes: readonly ResolvedTheme[]): string {
  const dark = [
    '@custom-variant dark {',
    '  &:where([data-mode="dark"], [data-mode="dark"] *) {',
    '    @slot;',
    '  }',
    '  @media (prefers-color-scheme: dark) {',
    '    &:where([data-mode="system"], [data-mode="system"] *) {',
    '      @slot;',
    '    }',
    '  }',
    '}',
  ];
  const perTheme = themes.map(({ definition: { name } }) => {
    const scope = `[data-theme="${name}"]`;
    return `@custom-variant theme-${name} (&:where(${scope}, ${scope} *));`;
  });
  return `${[...dark, ...perTheme].join('\n')}\n`;
}

export function toJson(themes: readonly ResolvedTheme[]) {
  return {
    base: baseTokens,
    themes: Object.fromEntries(
      themes.map(theme => [
        theme.definition.name,
        {
          label: theme.definition.label,
          radius: theme.radius,
          light: theme.modes.light,
          dark: theme.modes.dark,
        },
      ])
    ),
  };
}

const ROOT_FONT_SIZE = 16;
const toPoints = (value: string) =>
  value.endsWith('rem')
    ? Number.parseFloat(value) * ROOT_FONT_SIZE
    : value.endsWith('px')
      ? Number.parseFloat(value)
      : Number.parseFloat(value) || 0;
const mapValues = <T extends Record<string, string>, R>(record: T, fn: (value: string) => R) =>
  Object.fromEntries(Object.entries(record).map(([key, value]) => [key, fn(value)])) as {
    [K in keyof T]: R;
  };

export interface NativeShadow {
  shadowColor: string;
  shadowOpacity: number;
  shadowRadius: number;
  shadowOffset: { width: number; height: number };
  elevation: number;
}

/** Theme values for React Native: hex/rgba colors and numeric sizes in points. */
export interface NativeTheme {
  name: string;
  label: string;
  mode: Mode;
  colors: Record<SemanticColor, string>;
  space: Record<keyof typeof baseTokens.space, number>;
  radius: Record<keyof ResolvedTheme['radius'], number>;
  text: Record<keyof typeof baseTokens.text, number>;
  leading: Record<keyof typeof baseTokens.leading, number>;
  weight: Record<keyof typeof baseTokens.weight, '400' | '500' | '600' | '700'>;
  control: Record<keyof typeof baseTokens.control, number>;
  duration: Record<keyof typeof baseTokens.duration, number>;
  shadow: Record<'sm' | 'md' | 'lg', NativeShadow>;
  fontFamily: { sans: string | undefined; mono: string | undefined };
}

export type NativeThemes = Record<string, Record<Mode, NativeTheme>>;

const nativeShadows = (mode: Mode): NativeTheme['shadow'] => {
  const color = mode === 'light' ? '#1a1c25' : '#000000';
  const factor = mode === 'light' ? 1 : 2.5;
  return {
    sm: {
      shadowColor: color,
      shadowOpacity: 0.08 * factor,
      shadowRadius: 2,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
    },
    md: {
      shadowColor: color,
      shadowOpacity: 0.1 * factor,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 4,
    },
    lg: {
      shadowColor: color,
      shadowOpacity: 0.14 * factor,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 8 },
      elevation: 10,
    },
  };
};

export function toNative(themes: readonly ResolvedTheme[]): NativeThemes {
  const result: NativeThemes = {};
  for (const theme of themes) {
    const build = (mode: Mode): NativeTheme => ({
      name: theme.definition.name,
      label: theme.definition.label,
      mode,
      colors: Object.fromEntries(
        semanticColors.map(name => {
          const value = theme.modes[mode].colors[name];
          return [name, value.includes('/') ? toRgba(value) : toHex(value)];
        })
      ) as Record<SemanticColor, string>,
      space: mapValues(baseTokens.space, toPoints),
      radius: mapValues(theme.radius, value => (value === '9999px' ? 9999 : toPoints(value))),
      text: mapValues(baseTokens.text, toPoints),
      leading: mapValues(baseTokens.leading, Number),
      weight: { ...baseTokens.weight },
      control: mapValues(baseTokens.control, toPoints),
      duration: mapValues(baseTokens.duration, Number.parseFloat),
      shadow: nativeShadows(mode),
      fontFamily: { sans: undefined, mono: undefined },
    });
    result[theme.definition.name] = { light: build('light'), dark: build('dark') };
  }
  return result;
}
