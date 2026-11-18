import { describe, expect, it } from 'vitest';
import {
  builtInThemes,
  resolveTheme,
  toCss,
  toJson,
  toNative,
  toTailwindTheme,
  toTailwindVariants,
} from '../src/index.js';

const resolved = builtInThemes.map(resolveTheme);
const repertoire = ['terra', 'supernova', 'aurora', 'solstice'] as const;

describe('toCss', () => {
  const css = toCss(resolved);

  it('declares base tokens on :root', () => {
    expect(css).toMatch(/:root \{\n {2}--cosm-space-unit: 0\.25rem;/);
  });

  it('scopes every theme and mode, defaulting to the first theme', () => {
    expect(css).toContain('[data-theme="cosmos"],\n:root:not([data-theme]) {');
    expect(css).toContain('[data-theme="nebula"][data-mode="dark"] {');
    expect(css).toContain('@media (prefers-color-scheme: dark)');
    expect(css).toContain('[data-theme="nebula"][data-mode="system"]');
    expect(css).toContain('color-scheme: dark;');
  });

  it.each(repertoire)('emits %s colors in theme-scoped light and dark CSS', name => {
    const theme = resolved.find(candidate => candidate.definition.name === name);
    expect(theme).toBeDefined();

    for (const mode of ['light', 'dark'] as const) {
      const selector =
        mode === 'light' ? `[data-theme="${name}"]` : `[data-theme="${name}"][data-mode="dark"]`;
      const start = css.indexOf(`${selector} {`);
      expect(start, `${name}/${mode} selector`).toBeGreaterThanOrEqual(0);
      const block = css.slice(start, css.indexOf('\n}', start));
      expect(block).toContain(`--cosm-primary: ${theme?.modes[mode].colors.primary};`);
      expect(block).toContain(`--cosm-bg: ${theme?.modes[mode].colors.bg};`);
    }

    expect(css).toContain(`[data-theme="${name}"][data-mode="system"]`);
  });
});

describe('Tailwind outputs', () => {
  it('maps utilities to Cosmos variables', () => {
    const theme = toTailwindTheme(resolved);
    expect(theme.startsWith('@theme inline {')).toBe(true);
    expect(theme).toContain('--color-primary: var(--cosm-primary);');
    expect(theme).toContain('--radius-md: var(--cosm-radius-md);');
    expect(theme).toContain('--spacing: var(--cosm-space-unit);');
  });

  it('defines dark and per-theme variants', () => {
    const variants = toTailwindVariants(resolved);
    expect(variants).toContain('@custom-variant dark {');
    expect(variants).toContain('@custom-variant theme-nebula');
    for (const name of repertoire) {
      expect(variants).toContain(
        `@custom-variant theme-${name} (&:where([data-theme="${name}"], [data-theme="${name}"] *));`
      );
    }
  });
});

describe('toNative', () => {
  const native = toNative(resolved);

  it('converts colors to hex/rgba and sizes to points', () => {
    const theme = native.cosmos?.dark;
    expect(theme?.colors.bg).toMatch(/^#[0-9a-f]{6}$/);
    expect(theme?.colors.overlay).toMatch(/^rgba\(/);
    expect(theme?.space.lg).toBe(16);
    expect(theme?.radius.full).toBe(9999);
    expect(theme?.text.md).toBe(16);
  });

  it.each(repertoire)('provides %s colors in both native modes', name => {
    const resolvedTheme = resolved.find(theme => theme.definition.name === name);
    const output = native[name];
    expect(output?.light.name).toBe(name);
    expect(output?.dark.name).toBe(name);
    expect(output?.light.colors.primary).toMatch(/^#[0-9a-f]{6}$/);
    expect(output?.dark.colors.primary).toMatch(/^#[0-9a-f]{6}$/);
    expect(output?.light.colors.primary).not.toBe(output?.dark.colors.primary);
    expect(output?.light.colors.bg).toMatch(/^#[0-9a-f]{6}$/);
    expect(output?.dark.colors.bg).toMatch(/^#[0-9a-f]{6}$/);
    expect(Object.keys(output?.light.colors ?? {}).sort()).toEqual(
      Object.keys(resolvedTheme?.modes.light.colors ?? {}).sort()
    );
    expect(output?.dark.mode).toBe('dark');
  });
});

describe('toJson', () => {
  it('lists every theme with both modes', () => {
    const json = toJson(resolved);
    expect(Object.keys(json.themes)).toEqual(builtInThemes.map(theme => theme.name));
    expect(json.themes.nebula?.dark.colors.fg).toBeTypeOf('string');
  });

  it.each(repertoire)('serializes %s label and both resolved mode palettes', name => {
    const expected = resolved.find(theme => theme.definition.name === name);
    const output = toJson(resolved).themes[name];
    expect(output?.label).toBe(expected?.definition.label);
    expect(output?.light.colors.primary).toBe(expected?.modes.light.colors.primary);
    expect(output?.dark.colors.primary).toBe(expected?.modes.dark.colors.primary);
    expect(output?.light.colors.bg).toBe(expected?.modes.light.colors.bg);
    expect(output?.dark.colors.bg).toBe(expected?.modes.dark.colors.bg);
  });
});
