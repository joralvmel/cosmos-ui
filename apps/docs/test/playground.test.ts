// @vitest-environment happy-dom
import {
  badgeContract,
  buttonContract,
  checkboxContract,
  iconButtonContract,
  iconContract,
  listboxContract,
  listboxItemExamples,
  listboxValueExamples,
  popoverContract,
  switchContract,
  textFieldContract,
} from '@joralvmel/cosmos-core';
import type { CosmBadge } from '@joralvmel/cosmos-elements/badge';
import type { CosmButton } from '@joralvmel/cosmos-elements/button';
import type { CosmSwitch } from '@joralvmel/cosmos-elements/switch';
import type { CosmTextField } from '@joralvmel/cosmos-elements/text-field';
import { iconCatalog, searchIconCatalog } from '@joralvmel/cosmos-icons';
import { heart } from '@joralvmel/cosmos-icons/heart';
import { house } from '@joralvmel/cosmos-icons/house';
import { search } from '@joralvmel/cosmos-icons/search';
import { star } from '@joralvmel/cosmos-icons/star';
import '@joralvmel/cosmos-elements/button';
import '@joralvmel/cosmos-elements/badge';
import '@joralvmel/cosmos-elements/checkbox';
import '@joralvmel/cosmos-elements/icon-button';
import '@joralvmel/cosmos-elements/listbox';
import '@joralvmel/cosmos-elements/popover';
import '@joralvmel/cosmos-elements/text-field';
import '@joralvmel/cosmos-elements/switch';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  initPlayground,
  isPortablePaint,
  type PlaygroundLabels,
  SITE_THEME_KEY,
  TAB_STORAGE_KEY,
} from '../src/lib/playground';
import { applySiteTheme } from '../src/lib/theme';

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
  switchLabel: 'Enable notifications',
  tabs: { html: 'HTML', react: 'React', angular: 'Angular', native: 'React Native' },
  textFieldDefaults: {
    label: 'Email address',
    clearLabel: 'Clear text',
    revealPasswordLabel: 'Show password',
    hidePasswordLabel: 'Hide password',
  },
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

async function editTextField(field: CosmTextField, value: string) {
  await field.updateComplete;
  const input = field.shadowRoot?.querySelector<HTMLInputElement>('[part="input"]');
  if (!input) throw new Error('Missing text field input');
  input.value = value;
  input.dispatchEvent(new Event('input'));
}

async function activateSwitch(control: CosmSwitch) {
  await control.updateComplete;
  const input = control.shadowRoot?.querySelector<HTMLInputElement>('[part="input"]');
  if (!input) throw new Error('Missing Switch input');
  input.click();
  await control.updateComplete;
}

beforeEach(() => {
  document.documentElement.removeAttribute('data-theme');
});
afterEach(() => {
  document.body.replaceChildren();
});

describe('Playground', () => {
  it('starts optional icon references empty, supports selection and clears them across four snippets', async () => {
    const root = document.createElement('div');
    const target = document.createElement('cosm-badge') as CosmBadge;
    target.dataset.playgroundTarget = '';
    target.textContent = 'Badge';
    root.append(target);
    document.body.append(root);
    const controller = initPlayground(root, {
      contract: badgeContract,
      content: 'Badge',
      labels,
      themes: [],
      referenceValues: { IconDefinition: { heart, house, search, star } },
      storage: { getItem: () => null, setItem: () => {} },
    });

    await target.updateComplete;
    const control = root.querySelector<HTMLSelectElement>('[data-prop="startIcon"]');
    if (!control) throw new Error('Missing Badge startIcon control');
    expect(control.options[0]?.textContent).toBe('None');
    expect(control.value).toBe('');
    expect(target.startIcon).toBeUndefined();
    for (const platform of ['html', 'react', 'angular', 'native'] as const) {
      expect(controller.code(platform)).not.toContain('cosmos-icons/');
      expect(controller.code(platform)).not.toContain('startIcon');
      expect(controller.code(platform)).toContain('>Badge</');
    }

    control.value = 'heart';
    control.dispatchEvent(new Event('input'));
    await target.updateComplete;
    expect(target.startIcon).toBe(heart);
    for (const [platform, expected] of [
      ['html', 'element.startIcon = heart;'],
      ['react', 'startIcon={heart}'],
      ['angular', '[startIcon]="heart"'],
      ['native', 'startIcon={heart}'],
    ] as const) {
      controller.select(platform);
      expect(controller.code()).toContain(expected);
      expect(controller.code()).toContain('@joralvmel/cosmos-icons/heart');
    }
    expect(controller.code('native')).not.toContain('<Text>Badge</Text>');

    control.value = '';
    control.dispatchEvent(new Event('input'));
    await target.updateComplete;
    expect(controller.values.startIcon).toBeUndefined();
    expect(target.startIcon).toBeUndefined();
    for (const platform of ['html', 'react', 'angular', 'native'] as const) {
      expect(controller.code(platform)).not.toContain('startIcon');
      expect(controller.code(platform)).not.toContain('cosmos-icons/');
    }
  });

  it('initializes Switch with a required label and no child content on every platform', async () => {
    const root = document.createElement('div');
    const target = document.createElement('cosm-switch');
    target.dataset.playgroundTarget = '';
    root.append(target);
    document.body.append(root);
    const controller = initPlayground(root, {
      contract: switchContract,
      content: 'must not become child content',
      labels: { ...labels, switchLabel: 'Activar notificaciones' },
      themes: [],
      storage: { getItem: () => null, setItem: () => {} },
    });

    await target.updateComplete;
    expect(target.label).toBe('Activar notificaciones');
    expect(target.childNodes).toHaveLength(0);
    expect(root.querySelector<HTMLInputElement>('[data-prop="label"]')?.value).toBe(
      'Activar notificaciones'
    );
    for (const platform of ['html', 'react', 'angular', 'native'] as const) {
      expect(controller.code(platform)).toContain('Activar notificaciones');
    }

    controller.set('size', 27);
    controller.set('checked', false);
    expect(controller.code('html')).toContain('size="27"');
    expect(controller.code('react')).toContain('size={27}');
    expect(controller.code('angular')).toContain('[size]="27"');
    expect(controller.code('native')).not.toMatch(/\b(?:size|name|value)=/);
    expect(controller.code('native')).toContain('checked={false}');
    const invalid = root.querySelector<CosmSwitch>('cosm-switch[data-prop="invalid"]');
    if (!invalid) throw new Error('Missing Switch invalid control');
    await activateSwitch(invalid);
    await target.updateComplete;
    expect(target.invalid).toBe(true);
    expect(target.shadowRoot?.querySelector('input')?.getAttribute('aria-invalid')).toBe('true');
    expect(controller.code('html')).toContain(' invalid');
    expect(controller.code('native')).toContain('invalid');
    expect(invalid.invalid).toBe(false);
    const disabled = root.querySelector<CosmSwitch>('cosm-switch[data-prop="disabled"]');
    if (!disabled) throw new Error('Missing disabled control');
    await activateSwitch(disabled);
    await target.updateComplete;
    expect(target.disabled).toBe(true);
    expect(disabled.disabled).toBe(false);
    await activateSwitch(disabled);
    await target.updateComplete;
    expect(target.disabled).toBe(false);
    const size = root.querySelector<CosmTextField>('cosm-text-field[data-prop="size"]');
    if (!size) throw new Error('Missing Switch size editor');
    await editTextField(size, '0');
    await size.updateComplete;
    expect(size.value).toBe('27');
    expect(target.size).toBe(27);
    await editTextField(size, '31');
    await target.updateComplete;
    expect(target.size).toBe(31);
    expect(controller.code('react')).toContain('size={31}');
    controller.set('size', 27);
    for (const invalid of [0, -1, Number.POSITIVE_INFINITY, 'wide']) {
      controller.set('size', invalid);
      expect(target.size).toBe(27);
      expect(root.textContent).toContain('non-empty label and a positive size');
    }
    controller.set('label', '');
    expect(target.label).toBe('Activar notificaciones');
    controller.set('size', 'sm');
    await target.updateComplete;
    expect(target.size).toBe('sm');
    expect(root.textContent).not.toContain('non-empty label and a positive size');
  });

  it('initializes the checkbox with a localized accessible label in the preview and snippets', async () => {
    const root = document.createElement('div');
    const target = document.createElement('cosm-checkbox');
    target.dataset.playgroundTarget = '';
    root.append(target);
    document.body.append(root);
    const controller = initPlayground(root, {
      contract: checkboxContract,
      content: '',
      labels: { ...labels, checkboxLabel: 'Acepto los términos' },
      themes: [],
      storage: { getItem: () => null, setItem: () => {} },
    });

    await target.updateComplete;
    expect(target.label).toBe('Acepto los términos');
    expect(root.querySelector<HTMLInputElement>('[data-prop="label"]')?.value).toBe(
      'Acepto los términos'
    );
    for (const platform of ['html', 'react', 'angular', 'native'] as const) {
      expect(controller.code(platform)).toContain('Acepto los términos');
    }

    controller.set('checked', true);
    await target.updateComplete;
    expect(target.checked).toBe(true);
    expect(controller.code('html')).toContain('label="Acepto los términos"');
  });

  it('resolves collection controls, ownership and numeric sizes in the listbox preview', async () => {
    const root = document.createElement('div');
    const target = document.createElement('cosm-listbox');
    target.dataset.playgroundTarget = '';
    target.label = 'Choose produce';
    target.items = listboxItemExamples.grouped ?? [];
    root.append(target);
    document.body.append(root);
    const controller = initPlayground(root, {
      contract: listboxContract,
      content: '',
      labels,
      themes: [],
      referenceValues: {
        ListboxItems: listboxItemExamples,
        ListboxValues: listboxValueExamples,
      },
      storage: { getItem: () => null, setItem: () => {} },
    });
    controller.set('selectionMode', 'multiple');
    controller.set('selectedValues', 'apple-cherry');
    controller.set('size', 57);
    const current = root.querySelector('cosm-listbox');
    if (!current) throw new Error('Missing remounted Listbox');
    await current.updateComplete;
    expect(current.selectedValues).toEqual(['apple', 'cherry']);
    expect(current.size).toBe(57);
    expect(controller.code('html')).toContain('element.selectedValues = appleCherry;');
    expect(controller.code('react')).toContain('size={57}');
    controller.set('selectionMode', 'single');
    expect(controller.values.selectionMode).toBe('multiple');
    expect(root.querySelector('[role="status"]')?.textContent).toBeTruthy();
    controller.set('selectedValues', undefined);
    controller.set('defaultSelectedValues', 'cherry');
    const autonomous = root.querySelector('cosm-listbox');
    if (!autonomous) throw new Error('Missing autonomous Listbox');
    await autonomous.updateComplete;
    expect(autonomous.shadowRoot?.querySelectorAll('[aria-selected="true"]')).toHaveLength(1);
    expect(controller.code('native')).not.toContain('selectedValues={');
    controller.set('locale', '');
    expect(controller.values.locale).toBeUndefined();
    controller.set('size', 0);
    expect(controller.values.size).toBe(57);
  });

  it('validates popover spacing and close labels before updating the preview', async () => {
    const root = document.createElement('div');
    const target = document.createElement('cosm-popover');
    target.dataset.playgroundTarget = '';
    root.append(target);
    document.body.append(root);
    const controller = initPlayground(root, {
      contract: popoverContract,
      content: 'Details',
      labels: { ...labels, popoverCloseLabel: 'Cerrar' },
      themes: [],
      storage: { getItem: () => null, setItem: () => {} },
    });
    controller.set('closable', true);
    controller.set('arrow', true);
    controller.set('gap', 0);
    await target.updateComplete;
    expect(target.gap).toBe(0);
    expect(target.closeLabel).toBe('Cerrar');
    expect(controller.code('react')).toContain('gap={0}');
    controller.set('gap', -1);
    controller.set('closeLabel', ' ');
    expect(target.gap).toBe(0);
    expect(target.closeLabel).toBe('Cerrar');
    expect(root.textContent).toContain('non-empty close label');
  });

  it('remounts the popover preview when its initial open state changes', async () => {
    const root = document.createElement('div');
    const target = document.createElement('cosm-popover');
    target.dataset.playgroundTarget = '';
    const trigger = document.createElement('button');
    trigger.slot = 'trigger';
    trigger.textContent = 'Details';
    target.append(trigger);
    root.append(target);
    document.body.append(root);
    const controller = initPlayground(root, {
      contract: popoverContract,
      content: 'Details',
      labels,
      themes: [],
      storage: { getItem: () => null, setItem: () => {} },
    });
    await target.updateComplete;
    controller.set('defaultOpen', true);
    const replacement = root.querySelector('cosm-popover');
    if (!replacement) throw new Error('Missing remounted popover');
    await replacement.updateComplete;
    expect(replacement).not.toBe(target);
    expect(replacement.open).toBe(true);
    expect(replacement.openControlled).toBe(false);
    expect(replacement.querySelector('button')).toBe(trigger);
  });

  it('starts boolean state controls autonomous and retains explicit false bindings', () => {
    const root = document.createElement('div');
    const target = document.createElement('div');
    target.dataset.playgroundTarget = '';
    root.append(target);
    document.body.append(root);
    const controller = initPlayground(root, {
      contract: popoverContract,
      content: 'Details',
      labels,
      themes: [],
      storage: { getItem: () => null, setItem: () => {} },
    });
    const open = root.querySelector<HTMLSelectElement>('[data-prop="open"]');
    if (!open) throw new Error('Missing open control');
    expect(controller.values.open).toBeUndefined();
    open.value = 'false';
    open.dispatchEvent(new Event('input'));
    expect(controller.values.open).toBe(false);
    expect(controller.code('react')).toContain('open={false}');
    open.value = '';
    open.dispatchEvent(new Event('input'));
    expect(controller.values.open).toBeUndefined();
    expect(controller.code('react')).not.toContain('open={false}');
  });

  it('supports icon children, localized required labels and explicit toggle ownership', async () => {
    const root = document.createElement('div');
    const preview = document.createElement('div');
    preview.dataset.cosmPreview = '';
    const target = document.createElement('cosm-icon-button');
    target.dataset.playgroundTarget = '';
    const icon = document.createElement('cosm-icon');
    icon.icon = heart;
    target.append(icon);
    preview.append(target);
    root.append(preview);
    document.body.append(root);
    const controller = initPlayground(root, {
      contract: iconButtonContract,
      content: '',
      child: { contract: iconContract, values: { icon: 'heart' } },
      labels: { ...labels, iconButtonLabel: 'Favorito', autonomous: 'Autónomo' },
      themes: [],
      storage: { getItem: () => null, setItem: () => {} },
    });
    expect(controller.values.label).toBe('Favorito');
    expect(controller.values.pressed).toBeUndefined();
    expect(root.querySelector('[data-prop="pressed"] option')?.textContent).toBe('Autónomo');
    for (const name of Object.keys(iconButtonContract.props)) {
      expect(root.querySelector(`[data-prop="${name}"]`), name).not.toBeNull();
    }
    controller.set('label', ' ');
    expect(controller.values.label).toBe('Favorito');
    controller.set('mode', 'toggle');
    const pressed = root.querySelector<HTMLSelectElement>('[data-prop="pressed"]');
    if (!pressed) throw new Error('Missing pressed control');
    pressed.value = 'false';
    pressed.dispatchEvent(new Event('input'));
    await target.updateComplete;
    expect(controller.values.pressed).toBe(false);
    expect(target.pressedControlled).toBe(true);
    target.click();
    await target.updateComplete;
    expect(target.pressed).toBe(false);
    controller.set('pressed', true);
    await target.updateComplete;
    target.click();
    expect(target.pressed).toBe(true);
    controller.set('pressed', undefined);
    expect(target.pressedControlled).toBe(false);
    await target.updateComplete;
    target.click();
    await target.updateComplete;
    expect(target.pressed).toBe(false);
    expect(target.firstElementChild).toBe(icon);
    expect(icon.icon).toBe(heart);
    expect(controller.code('react')).toContain('<Icon icon={heart}></Icon>');
  });

  it('combines catalog category and search, and copies the selected icon style and size', async () => {
    const root = document.createElement('div');
    const preview = document.createElement('div');
    preview.dataset.cosmPreview = '';
    preview.dataset.theme = 'cosmos';
    preview.dataset.mode = 'light';
    const target = document.createElement('cosm-icon');
    target.dataset.playgroundTarget = '';
    preview.append(target);
    root.append(preview);
    document.body.append(root);
    const items = [
      { name: 'house', category: 'navigation', tags: ['home'] },
      { name: 'heart', category: 'shapes', tags: ['love'] },
    ];
    const writeText = vi.fn(async () => {});
    const controller = initPlayground(root, {
      contract: iconContract,
      content: '',
      labels,
      themes: [
        { name: 'cosmos', label: 'Cosmos' },
        { name: 'nebula', label: 'Nebula' },
      ],
      referenceCatalogs: {
        IconDefinition: {
          items,
          search: query => searchIconCatalog(items, query),
          load: async name => (name === 'heart' ? heart : house),
          preview: async () => document.createElement('cosm-icon'),
        },
      },
      clipboard: { writeText },
      storage: { getItem: key => (key === SITE_THEME_KEY ? 'nebula' : null), setItem: () => {} },
    });
    const category = root.querySelector<HTMLSelectElement>('[data-icon-category]');
    const searchInput = root.querySelector<CosmTextField>('[data-icon-search]');
    const size = root.querySelector<HTMLSelectElement>('[data-icon-size]');
    const style = root.querySelector<HTMLSelectElement>('[data-icon-style]');
    if (!category || !searchInput || !size || !style) throw new Error('Missing catalog controls');
    const gallery = root.querySelector<HTMLElement>('.cosm-icon-gallery');
    if (!gallery) throw new Error('Missing gallery');
    expect(gallery.hasAttribute('data-cosm-preview')).toBe(true);
    expect(gallery.dataset.theme).toBe('cosmos');
    expect(gallery.dataset.mode).toBe('light');
    const [theme, mode] = root.querySelectorAll<HTMLSelectElement>(
      '.cosm-playground-toolbar select'
    );
    if (!theme || !mode) throw new Error('Missing theme controls');
    theme.value = 'nebula';
    theme.dispatchEvent(new Event('change'));
    mode.value = 'dark';
    mode.dispatchEvent(new Event('change'));
    expect(gallery.dataset.theme).toBe(preview.dataset.theme);
    expect(gallery.dataset.mode).toBe(preview.dataset.mode);
    expect(gallery.hasAttribute('data-fixed')).toBe(true);
    expect(gallery.hasAttribute('data-fixed-mode')).toBe(true);
    category.value = 'shapes';
    category.dispatchEvent(new Event('change'));
    await vi.waitFor(() => expect(controller.values.icon).toBe('heart'));
    expect(root.querySelectorAll('[data-icon-name]')).toHaveLength(1);
    await editTextField(searchInput, 'house');
    expect(root.querySelectorAll('[data-icon-name]')).toHaveLength(0);
    expect(controller.values.icon).toBe('heart');
    await editTextField(searchInput, 'love');
    size.value = '32';
    size.dispatchEvent(new Event('change'));
    style.value = 'filled';
    style.dispatchEvent(new Event('change'));
    await vi.waitFor(() => expect(target.icon).toBe(heart));
    expect(target.size).toBe(32);
    expect(target.fill).toBe('currentColor');
    expect(root.querySelector('cosm-icon[data-playground-target]')).toBe(target);
    for (const technology of ['html', 'react', 'angular', 'native'] as const) {
      controller.select(technology);
      root.querySelector<CosmButton>('.cosm-playground-copy')?.click();
      await vi.waitFor(() => expect(writeText).toHaveBeenLastCalledWith(controller.code()));
      expect(controller.code()).toContain('cosmos-icons/heart');
      expect(controller.code()).toContain('32');
    }
    await vi.waitFor(() => {
      const thumbnail = root.querySelector('.cosm-icon-gallery')?.querySelector('cosm-icon');
      expect(thumbnail?.size).toBe(32);
      expect(thumbnail?.fill).toBe('currentColor');
    });
    size.value = 'custom';
    size.dispatchEvent(new Event('change'));
    expect(root.querySelector<HTMLInputElement>('[data-icon-custom-size]')?.hidden).toBe(false);
    controller.set('size', 37);
    controller.set('fill', 'none');
    expect(size.value).toBe('custom');
    const customSize = root.querySelector<HTMLInputElement>('[data-icon-custom-size]');
    if (!customSize) throw new Error('Missing custom size control');
    expect(customSize.hidden).toBe(false);
    expect(customSize.value).toBe('37');
    customSize.value = '41';
    customSize.dispatchEvent(new Event('input'));
    expect(target.size).toBe(41);
    expect(root.querySelectorAll('[data-prop="size"]')).toHaveLength(1);
    expect(root.querySelector('details [data-prop="size"]')).toBeNull();
    expect(style.value).toBe('outline');
    expect(root.querySelector('.cosm-icon-gallery')?.querySelector('cosm-icon')?.size).toBe(41);
    for (const [name, color] of [
      ['stroke', 'var(--cosm-primary)'],
      ['fill', 'var(--cosm-danger)'],
    ] as const) {
      const control = root.querySelector<HTMLSelectElement>(`select[data-prop="${name}"]`);
      if (!control) throw new Error(`Missing ${name} control`);
      expect(control.closest('.cosm-icon-toolbar')).not.toBeNull();
      control.value = color;
      control.dispatchEvent(new Event('change'));
    }
    expect(style.value).toBe('filled');
    expect(target.stroke).toBe('var(--cosm-primary)');
    expect(target.fill).toBe('var(--cosm-danger)');
    const thumbnail = root.querySelector('.cosm-icon-gallery')?.querySelector('cosm-icon');
    expect(thumbnail?.stroke).toBe('var(--cosm-primary)');
    expect(thumbnail?.fill).toBe('var(--cosm-danger)');
    for (const technology of ['html', 'react', 'angular', 'native'] as const) {
      expect(controller.code(technology)).toContain(
        technology === 'native' ? 'theme.colors.primary' : 'var(--cosm-primary)'
      );
      expect(controller.code(technology)).toContain(
        technology === 'native' ? 'theme.colors.danger' : 'var(--cosm-danger)'
      );
    }
    style.value = 'outline';
    style.dispatchEvent(new Event('change'));
    expect(root.querySelector<HTMLSelectElement>('[data-prop="fill"]')?.value).toBe('none');
    expect(root.querySelector('details')).toBeNull();
    const width = root.querySelector<HTMLInputElement>(
      '.cosm-icon-toolbar [data-prop="strokeWidth"]'
    );
    const label = root.querySelector<CosmTextField>(
      '.cosm-icon-toolbar cosm-text-field[data-prop="label"]'
    );
    const decorative = root.querySelector<CosmSwitch>(
      '.cosm-icon-toolbar [data-prop="decorative"]'
    );
    if (!width || !label || !decorative) throw new Error('Missing icon controls');
    width.value = '1.5';
    width.dispatchEvent(new Event('input'));
    await editTextField(label, 'Favorite');
    await vi.waitFor(() => expect(target.label).toBe('Favorite'));
    await activateSwitch(decorative);
    expect(target.strokeWidth).toBe(1.5);
    expect(target.label).toBe('Favorite');
    expect(controller.code('html')).toContain('label="Favorite"');
    expect(target.decorative).toBe(false);
    theme.value = '';
    theme.dispatchEvent(new Event('change'));
    mode.value = '';
    mode.dispatchEvent(new Event('change'));
    expect(gallery.hasAttribute('data-fixed')).toBe(false);
    expect(gallery.hasAttribute('data-fixed-mode')).toBe(false);
    expect(gallery.dataset.theme).toBe('nebula');
    expect(gallery.dataset.theme).toBe(preview.dataset.theme);
    expect(gallery.dataset.mode).toBe(preview.dataset.mode);
  });

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

  it('updates the preview element and every snippet when a control changes', async () => {
    const { root, target } = mount();
    const variant = root.querySelector<HTMLSelectElement>('[data-prop="variant"]');
    if (!variant) throw new Error('missing control');
    variant.value = 'outline';
    variant.dispatchEvent(new Event('input'));
    const fullWidth = root.querySelector<CosmSwitch>('cosm-switch[data-prop="fullWidth"]');
    if (!fullWidth) throw new Error('missing control');
    await activateSwitch(fullWidth);
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
    const copy = root.querySelector<CosmButton>('.cosm-playground-copy');
    if (!copy) throw new Error('missing copy button');
    await copy.updateComplete;
    copy.click();
    await vi.waitFor(() => expect(writeText).toHaveBeenCalledWith(controller.code('react')));
    expect(root.querySelector('.cosm-playground-status')?.textContent).toBe('Copied');
  });

  it('lets the preview use another theme and mode', () => {
    const { root } = mount();
    const [theme, mode] = [
      ...root.querySelectorAll<HTMLSelectElement>('.cosm-playground-toolbar select'),
    ];
    const preview = root.querySelector<HTMLElement>('[data-playground-target]')?.parentElement;
    const controls = root.querySelector<HTMLElement>('.cosm-playground-controls');
    const copy = root.querySelector<HTMLElement>('.cosm-playground-copy');
    const toolbar = root.querySelector<HTMLElement>('.cosm-playground-toolbar');
    const header = root.querySelector<HTMLElement>('.cosm-playground-code-header');
    if (!theme || !mode || !preview || !controls || !copy || !toolbar || !header)
      throw new Error('missing toolbar');
    expect(controls.dataset.theme).toBe('cosmos');
    expect(controls.dataset.mode).toBe('light');
    theme.value = 'nebula';
    theme.dispatchEvent(new Event('change'));
    mode.value = 'dark';
    mode.dispatchEvent(new Event('change'));
    expect(preview.dataset.theme).toBe('nebula');
    expect(preview.dataset.mode).toBe('dark');
    expect(preview.hasAttribute('data-fixed')).toBe(true);
    for (const surface of [controls, copy, toolbar, header]) {
      expect(surface.dataset.theme).toBe('nebula');
      expect(surface.dataset.mode).toBe('dark');
      expect(surface.hasAttribute('data-fixed')).toBe(true);
      expect(surface.hasAttribute('data-fixed-mode')).toBe(true);
    }
    theme.value = '';
    theme.dispatchEvent(new Event('change'));
    mode.value = '';
    mode.dispatchEvent(new Event('change'));
    expect(preview.hasAttribute('data-fixed-mode')).toBe(false);
    expect(preview.dataset.mode).toBe('light');
    for (const surface of [controls, copy, toolbar, header]) {
      expect(surface.dataset.theme).toBe('cosmos');
      expect(surface.dataset.mode).toBe('light');
      expect(surface.hasAttribute('data-fixed')).toBe(false);
      expect(surface.hasAttribute('data-fixed-mode')).toBe(false);
    }
  });

  it('preserves local overrides and resumes site updates on every control surface', () => {
    const { root, store } = mount();
    const [theme, mode] = root.querySelectorAll<HTMLSelectElement>(
      '.cosm-playground-toolbar select'
    );
    if (!theme || !mode) throw new Error('Missing theme controls');
    theme.value = 'nebula';
    theme.dispatchEvent(new Event('change'));
    mode.value = 'dark';
    mode.dispatchEvent(new Event('change'));
    const storage = { getItem: (key: string) => store.get(key) ?? null };
    applySiteTheme(storage);
    const surfaces = root.querySelectorAll<HTMLElement>('[data-cosm-preview]');
    for (const surface of surfaces) {
      expect(surface.dataset.theme).toBe('nebula');
      expect(surface.dataset.mode).toBe('dark');
    }
    theme.value = '';
    theme.dispatchEvent(new Event('change'));
    mode.value = '';
    mode.dispatchEvent(new Event('change'));
    store.set(SITE_THEME_KEY, 'nebula');
    document.documentElement.dataset.theme = 'dark';
    applySiteTheme(storage);
    for (const surface of surfaces) {
      expect(surface.hasAttribute('data-fixed')).toBe(false);
      expect(surface.hasAttribute('data-fixed-mode')).toBe(false);
      expect(surface.dataset.theme).toBe('nebula');
      expect(surface.dataset.mode).toBe('dark');
    }
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

  it('resolves reference controls and preserves false booleans in all code samples', async () => {
    const root = document.createElement('div');
    root.innerHTML = '<div data-cosm-preview><cosm-icon data-playground-target></cosm-icon></div>';
    document.body.append(root);
    const target = root.querySelector('cosm-icon');
    if (!target) throw new Error('missing icon preview target');
    const controller = initPlayground(root, {
      contract: iconContract,
      content: '',
      labels,
      themes: [],
      referenceValues: { IconDefinition: { house, heart } },
      storage: { getItem: () => null, setItem: () => {} },
    });

    expect(target.icon).toBe(house);
    const decorative = root.querySelector<CosmSwitch>('cosm-switch[data-prop="decorative"]');
    if (!decorative) throw new Error('missing decorative control');
    await activateSwitch(decorative);
    expect(decorative.checked).toBe(true);
    expect(target.decorative).toBe(true);
    expect(root.textContent).toContain('Enter a label');
    controller.set('label', 'Home');
    await activateSwitch(decorative);
    expect(target.decorative).toBe(false);
    expect(controller.code('html')).toContain('element.decorative = false');
    expect(controller.code('react')).toContain('decorative={false}');
    expect(controller.code('angular')).toContain('[decorative]="false"');

    const icon = root.querySelector<HTMLSelectElement>('[data-prop="icon"]');
    if (!icon) throw new Error('missing icon control');
    icon.value = 'heart';
    icon.dispatchEvent(new Event('input'));
    expect(target.icon).toBe(heart);
    expect(controller.code('native')).toContain("from '@joralvmel/cosmos-icons/heart'");
  });

  it('offers typed text-field controls, optional sample icons and collapsed advanced options', async () => {
    const root = document.createElement('div');
    root.innerHTML =
      '<div data-cosm-preview><cosm-text-field data-playground-target label="Email address" clear-label="Clear text" reveal-password-label="Show password" hide-password-label="Hide password"></cosm-text-field></div>';
    document.body.append(root);
    const target = root.querySelector('cosm-text-field') as CosmTextField;
    const controller = initPlayground(root, {
      contract: textFieldContract,
      content: '',
      labels,
      themes: [],
      referenceValues: { IconDefinition: { search, house, heart } },
      storage: { getItem: () => null, setItem: () => {} },
    });

    expect(target.label).toBe('Email address');
    expect(target.clearLabel).toBe('Clear text');
    expect(target.revealPasswordLabel).toBe('Show password');
    expect(target.hidePasswordLabel).toBe('Hide password');
    const labelControl = root.querySelector<CosmTextField>(
      '.cosm-playground-controls cosm-text-field[data-prop="label"]'
    );
    if (!labelControl) throw new Error('missing text field label editor');
    expect(labelControl).not.toBe(target);
    expect(labelControl.value).toBe('Email address');
    await editTextField(labelControl, 'Account name');
    await vi.waitFor(() => expect(target.label).toBe('Account name'));
    expect(controller.code('html')).toContain('label="Account name"');
    expect(controller.code('html')).not.toContain('cosm-playground-text-control');
    const advanced = root.querySelector('details');
    expect(advanced?.open).toBe(false);
    expect(advanced?.querySelector('[data-prop="pattern"]')).not.toBeNull();
    expect(advanced?.querySelector('[data-prop="defaultValue"]')).not.toBeNull();
    for (const name of ['clearable', 'passwordReveal', 'required', 'disabled', 'readOnly']) {
      expect(root.querySelector<CosmSwitch>(`cosm-switch[data-prop="${name}"]`)?.label).toBe(name);
    }
    const type = root.querySelector<HTMLSelectElement>('select[data-prop="type"]');
    if (!type) throw new Error('missing type select');
    type.value = 'email';
    type.dispatchEvent(new Event('input'));
    expect(target.type).toBe('email');
    const keyboard = root.querySelector<HTMLSelectElement>('select[data-prop="inputMode"]');
    if (!keyboard) throw new Error('missing keyboard select');
    keyboard.value = 'numeric';
    keyboard.dispatchEvent(new Event('input'));
    expect(target.inputMode).toBe('numeric');

    const size = root.querySelector<HTMLSelectElement>('select[data-prop="size"]');
    if (!size) throw new Error('missing size select');
    size.value = 'custom';
    size.dispatchEvent(new Event('input'));
    const height = root.querySelector<HTMLInputElement>('input[type="number"][step="any"]');
    if (!height) throw new Error('missing custom height');
    expect(height.parentElement?.hidden).toBe(false);
    height.value = '72';
    height.dispatchEvent(new Event('input'));
    expect(target.size).toBe(72);
    height.value = '-1';
    height.dispatchEvent(new Event('input'));
    expect(target.size).toBe(72);
    expect(root.textContent).toContain('valid positive size');
    size.value = 'sm';
    size.dispatchEvent(new Event('input'));
    expect(height.parentElement?.hidden).toBe(true);
    expect(target.size).toBe('sm');

    const icon = root.querySelector<HTMLSelectElement>('select[data-prop="startIcon"]');
    if (!icon) throw new Error('missing icon select');
    expect(icon.options.length).toBeLessThanOrEqual(5);
    expect(root.querySelector('.cosm-icon-gallery')).toBeNull();
    expect(root.querySelector('input[type="search"]')).toBeNull();
    expect(controller.code('react')).not.toContain('cosmos-icons/');
    icon.value = 'heart';
    icon.dispatchEvent(new Event('input'));
    expect(target.startIcon).toBe(heart);
    expect(controller.code('react')).toContain('cosmos-icons/heart');
    icon.value = '';
    icon.dispatchEvent(new Event('input'));
    expect(target.startIcon).toBeUndefined();
    expect(controller.code('react')).not.toContain('cosmos-icons/');

    controller.set('value', 'secret');
    controller.set('type', 'password');
    controller.set('clearable', true);
    controller.set('passwordReveal', true);
    await target.updateComplete;
    expect(
      target.shadowRoot?.querySelector('[part="clear-button"]')?.getAttribute('aria-label')
    ).toBe('Clear text');
    expect(
      target.shadowRoot?.querySelector('[part="reveal-button"]')?.getAttribute('aria-label')
    ).toBe('Show password');
    controller.set('label', '');
    await target.updateComplete;
    expect(target.label).toBe('Account name');
  });

  it('keeps stroke and fill independent and emits valid native theme colors', () => {
    const root = document.createElement('div');
    root.innerHTML = '<div data-cosm-preview><cosm-icon data-playground-target></cosm-icon></div>';
    document.body.append(root);
    const target = root.querySelector('cosm-icon');
    if (!target) throw new Error('missing icon preview target');
    const controller = initPlayground(root, {
      contract: iconContract,
      content: '',
      labels,
      themes: [],
      referenceValues: { IconDefinition: { house, heart } },
      storage: { getItem: () => null, setItem: () => {} },
    });
    controller.set('stroke', 'var(--cosm-primary)');
    controller.set('fill', 'var(--cosm-danger)');
    expect(target.stroke).toBe('var(--cosm-primary)');
    expect(target.fill).toBe('var(--cosm-danger)');
    expect(controller.code('react')).toContain('stroke="var(--cosm-primary)"');
    const native = controller.code('native');
    expect(native).toContain("import { Icon, useTheme } from '@joralvmel/cosmos-native';");
    expect(native).toContain('stroke={theme.colors.primary}');
    expect(native).toContain('fill={theme.colors.danger}');
    expect(native).not.toContain('var(');

    controller.set('fill', 'var(--my-brand)');
    expect(target.fill).toBe('var(--cosm-danger)');
    expect(root.textContent).toContain('Enter a valid size, stroke width or paint');
    expect(controller.code('native')).toContain('fill={theme.colors.danger}');
  });

  it.each([
    ['none', true],
    ['currentColor', true],
    ['var(--cosm-fg-muted)', true],
    ['#ff000080', true],
    ['rgb(255 0 0 / 50%)', true],
    ['hsl(10, 50%, 40%)', true],
    ['rebeccapurple', true],
    ['var(--cosm-unknown)', false],
    ['var(--brand)', false],
    ['color-mix(in srgb, red, blue)', false],
    ['oklch(0.7 0.1 200)', false],
  ])('treats %s as portable paint: %s', (value, expected) => {
    expect(isPortablePaint(value)).toBe(expected);
  });

  it('searches metadata and applies only the latest successfully loaded artwork', async () => {
    const root = document.createElement('div');
    const preview = document.createElement('div');
    const target = document.createElement('cosm-icon');
    preview.setAttribute('data-cosm-preview', '');
    target.setAttribute('data-playground-target', '');
    preview.append(target);
    root.append(preview);
    document.body.append(root);
    const pending = new Map<string, (value: unknown) => void>();
    const load = vi.fn(
      (name: string) => new Promise<unknown>(resolve => pending.set(name, resolve))
    );
    const items = [
      { name: 'house', category: 'navigation', tags: ['home'] },
      { name: 'heart', category: 'shapes', tags: ['love'] },
      { name: 'star', category: 'shapes', tags: ['favorite'] },
    ];
    const controller = initPlayground(root, {
      contract: iconContract,
      content: '',
      labels,
      themes: [],
      referenceCatalogs: {
        IconDefinition: {
          items,
          search: query => searchIconCatalog(items, query),
          load,
        },
      },
      storage: { getItem: () => null, setItem: () => {} },
    });

    controller.set('icon', 'heart');
    pending.get('heart')?.(heart);
    await Promise.resolve();
    pending.get('house')?.(house);
    await Promise.resolve();
    expect(root.querySelector('cosm-icon')?.icon).toBe(heart);
    expect(controller.code('react')).toContain('cosmos-icons/heart');
    const search = root.querySelector<CosmTextField>('[data-icon-search]');
    if (!search) throw new Error('missing search');
    await editTextField(search, 'favorite');
    expect(load).toHaveBeenLastCalledWith('star');
    expect(root.querySelectorAll('[data-prop="icon"] option')).toHaveLength(1);
  });

  it.each(['heart', 'star'])(
    'places exact %s first in the real catalog control',
    async name => {
      const root = document.createElement('div');
      const preview = document.createElement('div');
      const target = document.createElement('cosm-icon');
      preview.setAttribute('data-cosm-preview', '');
      target.setAttribute('data-playground-target', '');
      preview.append(target);
      root.append(preview);
      document.body.append(root);
      const load = vi.fn(async () => house);
      initPlayground(root, {
        contract: iconContract,
        content: '',
        labels,
        themes: [],
        referenceCatalogs: {
          IconDefinition: {
            items: iconCatalog,
            search: query => searchIconCatalog(iconCatalog, query),
            load,
          },
        },
        storage: { getItem: () => null, setItem: () => {} },
      });
      const search = root.querySelector<CosmTextField>('[data-icon-search]');
      if (!search) throw new Error('missing search');
      await editTextField(search, name);
      const results = [...root.querySelectorAll<HTMLOptionElement>('[data-prop="icon"] option')];
      expect(results.length).toBeGreaterThan(10);
      expect(results[0]?.value).toBe(name);
      expect(results.slice(0, 10).map(item => item.value)).toContain(name);
      expect(load).toHaveBeenLastCalledWith(name);
      // Rendering all 2,052 real catalog options in happy-dom is slow under parallel Turbo load.
    },
    20_000
  );

  it('announces a failed icon load without changing the last successful selection', async () => {
    const root = document.createElement('div');
    const preview = document.createElement('div');
    const target = document.createElement('cosm-icon');
    preview.setAttribute('data-cosm-preview', '');
    target.setAttribute('data-playground-target', '');
    preview.append(target);
    root.append(preview);
    document.body.append(root);
    const controller = initPlayground(root, {
      contract: iconContract,
      content: '',
      labels,
      themes: [],
      referenceCatalogs: {
        IconDefinition: {
          items: [
            { name: 'house', category: 'navigation', tags: [] },
            { name: 'heart', category: 'shapes', tags: [] },
          ],
          search: query => searchIconCatalog(iconCatalog, query),
          load: name =>
            name === 'house' ? Promise.resolve(house) : Promise.reject(new Error('offline')),
        },
      },
      storage: { getItem: () => null, setItem: () => {} },
    });
    await vi.waitFor(() => expect(root.querySelector('cosm-icon')?.icon).toBe(house));
    controller.set('icon', 'heart');
    await vi.waitFor(() => expect(root.textContent).toContain('Could not load the selected icon.'));
    expect(root.querySelector('cosm-icon')?.icon).toBe(house);
    expect(controller.code('react')).toContain('cosmos-icons/house');
  });

  it('loads gallery thumbnails in batches and selects them through the existing controls', async () => {
    const root = document.createElement('div');
    root.innerHTML = '<div data-cosm-preview><cosm-icon data-playground-target></cosm-icon></div>';
    document.body.append(root);
    const items = iconCatalog.slice(0, 50);
    const preview = vi.fn(async () => document.createElement('cosm-icon'));
    const load = vi.fn(async () => house);
    const controller = initPlayground(root, {
      contract: iconContract,
      content: '',
      labels,
      themes: [],
      referenceCatalogs: {
        IconDefinition: {
          items,
          search: query => searchIconCatalog(items, query),
          load,
          preview,
        },
      },
      storage: { getItem: () => null, setItem: () => {} },
    });
    expect(preview).toHaveBeenCalledTimes(24);
    expect(root.querySelectorAll('.cosm-icon-choice')).toHaveLength(24);
    const more = root.querySelector<CosmButton>('.cosm-icon-more');
    if (!more) throw new Error('missing more button');
    await more.updateComplete;
    more.click();
    expect(preview).toHaveBeenCalledTimes(48);
    const button = root.querySelector<HTMLButtonElement>('.cosm-icon-choice');
    if (!button) throw new Error('missing gallery choice');
    button.click();
    await vi.waitFor(() => expect(button.getAttribute('aria-pressed')).toBe('true'));
    expect(load).toHaveBeenLastCalledWith(button.dataset.iconName);
    expect(controller.code('react')).toContain(`cosmos-icons/${button.dataset.iconName}`);
    expect(root.querySelector<HTMLSelectElement>('[data-prop="icon"]')?.value).toBe(
      button.dataset.iconName
    );
    expect(button.querySelector('[aria-hidden="true"] cosm-icon')).not.toBeNull();

    const search = root.querySelector<CosmTextField>('[data-icon-search]');
    if (!search) throw new Error('missing gallery search');
    await search.updateComplete;
    expect(search.label).toBe('Search icons');
    expect(search.helpText).toBe('50 icons found');
    const input = search.shadowRoot?.querySelector('input');
    expect(
      search.shadowRoot?.getElementById(input?.getAttribute('aria-describedby') ?? '')?.textContent
    ).toBe('50 icons found');
    await editTextField(search, 'no-matching-icons');
    expect(search.helpText).toBe('0 icons found');
    expect(root.querySelectorAll('.cosm-icon-choice')).toHaveLength(0);
    expect(more?.hidden).toBe(true);
    expect(root.textContent).toContain('0 icons found');
  });

  it('shows thumbnail failures without losing the usable icon selection', async () => {
    const root = document.createElement('div');
    root.innerHTML = '<div data-cosm-preview><cosm-icon data-playground-target></cosm-icon></div>';
    document.body.append(root);
    initPlayground(root, {
      contract: iconContract,
      content: '',
      labels,
      themes: [],
      referenceCatalogs: {
        IconDefinition: {
          items: [{ name: 'house', category: 'navigation', tags: [] }],
          search: () => [],
          load: async () => house,
          preview: async () => {
            throw new Error('offline');
          },
        },
      },
      storage: { getItem: () => null, setItem: () => {} },
    });
    await vi.waitFor(() =>
      expect(root.querySelector('.cosm-icon-choice')?.textContent).toContain('Preview unavailable')
    );
    expect(root.querySelector('cosm-icon')?.icon).toBe(house);
    expect(root.querySelector('.cosm-icon-choice')?.getAttribute('aria-pressed')).toBe('true');
  });
});
