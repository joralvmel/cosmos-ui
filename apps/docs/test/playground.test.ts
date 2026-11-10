// @vitest-environment happy-dom
import { buttonContract } from '@joralvmel/cosmos-core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initPlayground, type PlaygroundLabels, TAB_STORAGE_KEY } from '../src/lib/playground';

const labels: PlaygroundLabels = {
  controls: 'Controls',
  code: 'Code',
  copy: 'Copy code',
  copied: 'Copied',
  copyFailed: 'Copy failed',
  theme: 'Theme',
  mode: 'Mode',
  followSite: 'Site',
  light: 'Light',
  dark: 'Dark',
  nativeDemo: 'Native demo',
  tabs: { html: 'HTML', react: 'React', angular: 'Angular', native: 'React Native' },
};

function mount(options: { storage?: Map<string, string>; nativeDemoUrl?: string } = {}) {
  const root = document.createElement('div');
  root.innerHTML =
    '<div data-cosm-preview data-theme="cosmos" data-mode="light"><cosm-button data-playground-target>Save</cosm-button></div>';
  document.body.append(root);
  const store = options.storage ?? new Map<string, string>();
  const writeText = vi.fn(async () => {});
  const controller = initPlayground(root, {
    contract: buttonContract,
    content: 'Save',
    labels,
    themes: [
      { name: 'cosmos', label: 'Cosmos' },
      { name: 'nebula', label: 'Nebula' },
    ],
    nativeDemoUrl: options.nativeDemoUrl,
    storage: {
      getItem: key => store.get(key) ?? null,
      setItem: (key, value) => store.set(key, value),
    },
    clipboard: { writeText },
  });
  const target = root.querySelector('cosm-button') as unknown as HTMLElement &
    Record<string, unknown>;
  return { root, controller, store, writeText, target };
}

const tabs = (root: HTMLElement) => [...root.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
const visibleCode = (root: HTMLElement) =>
  root.querySelector('[role="tabpanel"]:not([hidden]) code')?.textContent ?? '';

beforeEach(() => {
  document.documentElement.removeAttribute('data-theme');
});
afterEach(() => {
  document.body.replaceChildren();
});

describe('Playground', () => {
  it('builds one control per contract prop and four code tabs', () => {
    const { root } = mount();
    expect(root.querySelectorAll('[data-prop]')).toHaveLength(
      Object.keys(buttonContract.props).length
    );
    expect(tabs(root).map(tab => tab.textContent)).toEqual([
      'HTML',
      'React',
      'Angular',
      'React Native',
    ]);
    expect(visibleCode(root)).toContain('<cosm-button>Save</cosm-button>');
  });

  it('follows the APG tabs pattern', () => {
    const { root } = mount();
    const [html, react] = tabs(root);
    expect(root.querySelector('[role="tablist"]')?.getAttribute('aria-label')).toBe('Code');
    expect(html?.getAttribute('aria-selected')).toBe('true');
    expect(html?.tabIndex).toBe(0);
    expect(react?.tabIndex).toBe(-1);
    const panel = document.getElementById(html?.getAttribute('aria-controls') ?? '');
    expect(panel?.getAttribute('role')).toBe('tabpanel');
    expect(panel?.getAttribute('aria-labelledby')).toBe(html?.id);

    html?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(react?.getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(react);
    react?.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    expect(tabs(root)[3]?.getAttribute('aria-selected')).toBe('true');
    tabs(root)[3]?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })
    );
    expect(html?.getAttribute('aria-selected')).toBe('true');
  });

  it('updates the preview element and every snippet when a control changes', () => {
    const { root, target } = mount();
    const variant = root.querySelector<HTMLSelectElement>('[data-prop="variant"]');
    if (!variant) throw new Error('missing control');
    variant.value = 'outline';
    variant.dispatchEvent(new Event('input'));
    const fullWidth = root.querySelector<HTMLInputElement>('[data-prop="fullWidth"]');
    if (!fullWidth) throw new Error('missing control');
    fullWidth.checked = true;
    fullWidth.dispatchEvent(new Event('input'));
    expect(target.variant).toBe('outline');
    expect(target.hasAttribute('full-width')).toBe(true);
    expect(visibleCode(root)).toContain(
      '<cosm-button variant="outline" full-width>Save</cosm-button>'
    );
    tabs(root)[2]?.click();
    expect(visibleCode(root)).toContain('<cosm-button variant="outline" fullWidth (press)=');
  });

  it('remembers the selected tab', () => {
    const storage = new Map<string, string>();
    const first = mount({ storage });
    first.controller.select('native');
    expect(storage.get(TAB_STORAGE_KEY)).toBe('native');
    const second = mount({ storage });
    expect(second.controller.selected).toBe('native');
    expect(visibleCode(second.root)).toContain("from '@joralvmel/cosmos-native'");
  });

  it('copies the visible snippet and announces it', async () => {
    const { root, writeText, controller } = mount();
    controller.select('react');
    root.querySelector<HTMLButtonElement>('.cosm-playground-copy')?.click();
    await vi.waitFor(() => expect(writeText).toHaveBeenCalledWith(controller.code('react')));
    expect(root.querySelector('[role="status"]')?.textContent).toBe('Copied');
  });

  it('lets the preview use another theme and mode', () => {
    const { root } = mount();
    const [theme, mode] = [
      ...root.querySelectorAll<HTMLSelectElement>('.cosm-playground-toolbar select'),
    ];
    const preview = root.querySelector<HTMLElement>('[data-cosm-preview]');
    if (!theme || !mode || !preview) throw new Error('missing toolbar');
    theme.value = 'nebula';
    theme.dispatchEvent(new Event('change'));
    mode.value = 'dark';
    mode.dispatchEvent(new Event('change'));
    expect(preview.dataset.theme).toBe('nebula');
    expect(preview.dataset.mode).toBe('dark');
    expect(preview.hasAttribute('data-fixed')).toBe(true);
    mode.value = '';
    mode.dispatchEvent(new Event('change'));
    expect(preview.hasAttribute('data-fixed-mode')).toBe(false);
    expect(preview.dataset.mode).toBe('light');
  });

  it('links to the native demo screen when available', () => {
    const { root } = mount({ nativeDemoUrl: 'https://example.com/button.tsx' });
    expect(root.querySelector('a.cosm-playground-native')?.getAttribute('href')).toBe(
      'https://example.com/button.tsx'
    );
  });

  it('never renders user text as HTML', () => {
    const { root, controller } = mount();
    controller.set('label', '<img src=x onerror=alert(1)>');
    expect(root.querySelector('img')).toBeNull();
    expect(visibleCode(root)).toContain('label="&lt;img src=x onerror=alert(1)>"');
  });
});
