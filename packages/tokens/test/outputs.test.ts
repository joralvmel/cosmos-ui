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
});

describe('toJson', () => {
  it('lists every theme with both modes', () => {
    const json = toJson(resolved);
    expect(Object.keys(json.themes)).toEqual(builtInThemes.map(theme => theme.name));
    expect(json.themes.nebula?.dark.colors.fg).toBeTypeOf('string');
  });
});
