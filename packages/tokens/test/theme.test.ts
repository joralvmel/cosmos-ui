import { describe, expect, it } from 'vitest';
import {
  builtInThemes,
  contrastRatio,
  defineTheme,
  resolveTheme,
  semanticColors,
  validateTheme,
} from '../src/index.js';

describe('defineTheme', () => {
  it('normalizes defaults', () => {
    const theme = defineTheme({ name: 'demo', seeds: { primary: 'oklch(0.6 0.15 140)' } });
    expect(theme).toMatchObject({ label: 'Demo', harmony: 'analogous', radius: 'rounded' });
    expect(theme.neutral).toEqual({ tint: 'primary', chroma: 0.012 });
  });

  it.each([
    ['', 'invalid name'],
    ['Bad Name', 'invalid name'],
    ['dark', 'reserved mode name'],
  ])('rejects the name %j (%s)', name => {
    expect(() => defineTheme({ name, seeds: { primary: 'red' } })).toThrow(/Invalid theme name/);
  });

  it('rejects invalid seed colors', () => {
    expect(() => defineTheme({ name: 'demo', seeds: { primary: 'not-a-color' } })).toThrow(
      /Invalid color/
    );
  });

  it('rejects unknown and prototype keys in mode overrides', () => {
    const polluted = JSON.parse('{"__proto__": {"polluted": true}}');
    expect(() =>
      defineTheme({ name: 'demo', seeds: { primary: 'red' }, modes: { light: polluted } })
    ).toThrow(/unknown token "__proto__"/);
    expect(() =>
      defineTheme({
        name: 'demo',
        seeds: { primary: 'red' },
        modes: { dark: { nope: 'red' } as never },
      })
    ).toThrow(/unknown token "nope"/);
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });

  it('applies valid overrides', () => {
    const theme = resolveTheme(
      defineTheme({
        name: 'demo',
        seeds: { primary: 'oklch(0.55 0.2 268)' },
        modes: { light: { bg: 'oklch(0.99 0 0)' } },
      })
    );
    expect(theme.modes.light.colors.bg).toBe('oklch(0.99 0 0)');
  });
});

describe('resolveTheme', () => {
  it('produces every semantic color for both modes', () => {
    for (const definition of builtInThemes) {
      const theme = resolveTheme(definition);
      for (const mode of ['light', 'dark'] as const) {
        for (const name of semanticColors) {
          expect(theme.modes[mode].colors[name], `${definition.name}/${mode}/${name}`).toMatch(
            /^oklch\(/
          );
        }
        for (const scale of Object.values(theme.modes[mode].scales)) expect(scale).toHaveLength(12);
      }
    }
  });

  it('keeps dark mode from being a plain inversion', () => {
    const { light, dark } = resolveTheme(builtInThemes[0] as never).modes;
    expect(dark.colors.surface).not.toBe(dark.colors.bg);
    expect(contrastRatio(dark.colors['surface-raised'], dark.colors.bg)).toBeGreaterThan(1);
    expect(light.colors.primary).not.toBe(dark.colors.primary);
  });

  it('derives the accent hue from the harmony', () => {
    const base = { name: 'demo', seeds: { primary: 'oklch(0.55 0.2 100)' } } as const;
    const complementary = resolveTheme(defineTheme({ ...base, harmony: 'complementary' }));
    expect(complementary.modes.light.colors.accent).toMatch(/ 280\)$/);
  });
});

describe('accessibility of built-in themes', () => {
  for (const definition of builtInThemes) {
    const report = validateTheme(resolveTheme(definition));

    it(`${definition.name}: meets WCAG 2.2 AA contrast in light and dark`, () => {
      const failures = report.contrast
        .filter(check => !check.pass)
        .map(c => `${c.mode} ${c.foreground}/${c.background} ${c.ratio} < ${c.minimum}`);
      expect(failures).toEqual([]);
    });

    it(`${definition.name}: status and chart colors survive color vision deficiencies`, () => {
      const failures = report.deficiencies
        .filter(check => !check.pass)
        .map(c => `${c.mode} ${c.deficiency} ${c.pair.join('/')} ${c.distance}`);
      expect(failures).toEqual([]);
    });

    it(`${definition.name}: reports APCA contrast for body text`, () => {
      const body = report.contrast.find(
        check => check.mode === 'light' && check.foreground === 'fg' && check.background === 'bg'
      );
      expect(Math.abs(body?.apca ?? 0)).toBeGreaterThan(75);
    });
  }
});

describe('robustness of the theme engine', () => {
  it('generates accessible themes for any primary seed and harmony', () => {
    const failures: string[] = [];
    for (let hue = 0; hue < 360; hue += 30) {
      for (const harmony of ['analogous', 'complementary', 'triadic'] as const) {
        const seed = `oklch(0.55 0.18 ${hue})`;
        const report = validateTheme(
          resolveTheme(defineTheme({ name: 'probe', seeds: { primary: seed }, harmony }))
        );
        if (!report.pass) failures.push(`hue ${hue} ${harmony}`);
      }
    }
    expect(failures).toEqual([]);
  });
});
