import { afterEach, describe, expect, it } from 'vitest';
import {
  getMode,
  getResolvedMode,
  getTheme,
  setMode,
  setTheme,
  themeInitScript,
} from '../src/runtime.js';

afterEach(() => {
  delete document.documentElement.dataset.theme;
  delete document.documentElement.dataset.mode;
  localStorage.clear();
});

describe('runtime', () => {
  it('sets and persists theme and mode', () => {
    setTheme('nebula');
    setMode('dark');
    expect(getTheme()).toBe('nebula');
    expect(getMode()).toBe('dark');
    expect(getResolvedMode()).toBe('dark');
    expect(localStorage.getItem('cosmos-ui:theme')).toBe('nebula');
  });

  it('can skip persistence and target another root', () => {
    const root = document.createElement('section');
    setTheme('cosmos', { root, storageKey: false });
    expect(root.dataset.theme).toBe('cosmos');
    expect(localStorage.length).toBe(0);
  });

  it('rejects invalid values', () => {
    expect(() => setTheme('<script>')).toThrow(TypeError);
    expect(() => setMode('dim' as never)).toThrow(TypeError);
    expect(() => themeInitScript("x';alert(1)//")).toThrow(TypeError);
  });

  it('restores the persisted choice with the init script', () => {
    localStorage.setItem('cosmos-ui:theme', 'nebula');
    localStorage.setItem('cosmos-ui:mode', 'dark');
    new Function(themeInitScript())();
    expect(getTheme()).toBe('nebula');
    expect(getMode()).toBe('dark');
  });
});
