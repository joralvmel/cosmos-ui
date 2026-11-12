import {
  type ComponentContract,
  type ControlValues,
  generateSnippets,
  type SnippetTarget,
  snippetTargets,
  supportsTarget,
  toAttribute,
} from '@joralvmel/cosmos-core';
import { searchIconCatalog } from '@joralvmel/cosmos-icons';
import { semanticColors } from '@joralvmel/cosmos-tokens';

export interface PlaygroundLabels {
  controls: string;
  code: string;
  copy: string;
  copied: string;
  copyFailed: string;
  theme: string;
  mode: string;
  followSite: string;
  light: string;
  dark: string;
  nativeDemo: string;
  iconSearch?: string;
  iconResults?: string;
  iconLoading?: string;
  iconError?: string;
  iconInvalid?: string;
  iconLabelRequired?: string;
  tabs: Record<SnippetTarget, string>;
}

export interface PlaygroundOptions {
  contract: ComponentContract;
  content: string;
  labels: PlaygroundLabels;
  themes: readonly { name: string; label: string }[];
  /** Link to the screen of the component in the native demo app (optional). */
  nativeDemoUrl?: string | undefined;
  /** Runtime sample values for named references shown in contract controls. */
  referenceValues?: Readonly<Record<string, Readonly<Record<string, unknown>>>>;
  referenceCatalogs?: Readonly<
    Record<
      string,
      {
        items: readonly { name: string; category: string; tags: readonly string[] }[];
        load: (name: string) => Promise<unknown>;
      }
    >
  >;
  storage?: Pick<Storage, 'getItem' | 'setItem'> | undefined;
  clipboard?: Pick<Clipboard, 'writeText'> | undefined;
}

export interface PlaygroundController {
  readonly values: ControlValues;
  /** Changes a prop as if the user edited its control. */
  set(name: string, value: ControlValues[string]): void;
  select(target: SnippetTarget): void;
  readonly selected: SnippetTarget;
  code(target?: SnippetTarget): string;
}

/**
 * Paints the generated snippets can express on every platform: `none`, `currentColor`, Cosmos color
 * tokens (`var(--cosm-primary)` → `theme.colors.primary` on native) and plain hex/rgb/hsl/named
 * colors. Other CSS (custom variables, `color-mix()`, `oklch()`) would be invalid React Native code.
 */
export function isPortablePaint(value: string): boolean {
  const paint = value.trim();
  const token = /^var\(--cosm-([a-z0-9-]+)\)$/.exec(paint)?.[1];
  if (token !== undefined) return (semanticColors as readonly string[]).includes(token);
  return (
    /^(?:none|currentColor|[a-z]+|#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8}))$/i.test(paint) ||
    /^(?:rgba?|hsla?)\([0-9.,%\s/+-]+\)$/i.test(paint)
  );
}

export const TAB_STORAGE_KEY = 'cosmos-docs:playground-tab';
export const SITE_THEME_KEY = 'cosmos-docs:theme';
const TAB_EVENT = 'cosmos-playground-tab';
let instances = 0;

function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attributes: Record<string, string> = {},
  text?: string
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, value);
  if (text !== undefined) node.textContent = text;
  return node;
}

function select(label: string, options: [string, string][], value: string) {
  const wrapper = element('label');
  wrapper.append(element('span', {}, label));
  const control = element('select');
  for (const [optionValue, optionLabel] of options) {
    const option = element('option', { value: optionValue }, optionLabel);
    option.selected = optionValue === value;
    control.append(option);
  }
  wrapper.append(control);
  return { wrapper, control };
}

/**
 * Builds the interactive part of a Playground inside `root`: controls generated from the contract,
 * accessible code tabs (WAI-ARIA APG tabs pattern) for HTML, React, Angular and React Native, a copy
 * button, and theme/mode pickers for the preview. Text is always set with `textContent`.
 */
export function initPlayground(
  root: HTMLElement,
  options: PlaygroundOptions
): PlaygroundController {
  const { contract, labels } = options;
  const storage = options.storage ?? globalThis.localStorage;
  const clipboard = options.clipboard ?? globalThis.navigator?.clipboard;
  const id = `cosm-playground-${++instances}`;
  const preview = root.querySelector<HTMLElement>('[data-cosm-preview]');
  const target = root.querySelector<HTMLElement>('[data-playground-target]');
  const targets = snippetTargets.filter(item => supportsTarget(contract, item));
  const values: ControlValues = {};
  for (const [name, spec] of Object.entries(contract.props)) {
    values[name] = spec.type === 'reference' ? spec.example : spec.default;
  }
  if (target) {
    for (const [name, spec] of Object.entries(contract.props)) {
      if (spec.type !== 'reference' || !spec.example) continue;
      const sample = options.referenceValues?.[spec.reference]?.[spec.example];
      if (sample === undefined && !options.referenceCatalogs?.[spec.reference]) {
        throw new Error(`No playground value configured for ${spec.reference} "${spec.example}".`);
      }
      if (sample !== undefined) Reflect.set(target, name, sample);
    }
  }

  // Theme and mode of the preview.
  if (preview) {
    const toolbar = element('div', { class: 'cosm-playground-toolbar' });
    const theme = select(
      labels.theme,
      [
        ['', labels.followSite],
        ...options.themes.map(item => [item.name, item.label] as [string, string]),
      ],
      ''
    );
    const mode = select(
      labels.mode,
      [
        ['', labels.followSite],
        ['light', labels.light],
        ['dark', labels.dark],
      ],
      ''
    );
    theme.control.addEventListener('change', () => {
      if (theme.control.value) {
        preview.setAttribute('data-fixed', '');
        preview.dataset.theme = theme.control.value;
      } else {
        preview.removeAttribute('data-fixed');
        preview.dataset.theme = storage?.getItem(SITE_THEME_KEY) ?? options.themes[0]?.name ?? '';
      }
    });
    mode.control.addEventListener('change', () => {
      if (mode.control.value) {
        preview.setAttribute('data-fixed-mode', '');
        preview.dataset.mode = mode.control.value;
      } else {
        preview.removeAttribute('data-fixed-mode');
        preview.dataset.mode = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
      }
    });
    toolbar.append(theme.wrapper, mode.wrapper);
    root.insertBefore(toolbar, preview);
  }

  // Controls generated from the contract.
  const fieldset = element('fieldset', { class: 'cosm-playground-controls not-content' });
  fieldset.append(element('legend', {}, labels.controls));
  const referenceStatus = element('span', { role: 'status', 'aria-live': 'polite' });
  let referenceRequest = 0;
  for (const [name, spec] of Object.entries(contract.props)) {
    const label = element('label');
    label.append(element('span', {}, name));
    let control: HTMLInputElement | HTMLSelectElement;
    if (spec.type === 'enum' || spec.type === 'reference') {
      control = element('select');
      const catalog =
        spec.type === 'reference' ? options.referenceCatalogs?.[spec.reference] : undefined;
      const choices = catalog
        ? catalog.items.map(item => item.name)
        : spec.type === 'enum'
          ? spec.values
          : (spec.options ?? []);
      for (const value of choices) {
        const option = element('option', { value }, value);
        option.selected = value === (spec.type === 'enum' ? spec.default : spec.example);
        control.append(option);
      }
      if (catalog) {
        const searchLabel = element('label');
        searchLabel.append(element('span', {}, labels.iconSearch ?? 'Search icons'));
        const searchInput = element('input', { type: 'search' });
        const results = element(
          'span',
          { role: 'status', 'aria-live': 'polite' },
          `${choices.length} ${labels.iconResults ?? 'icons found'}`
        );
        const iconSelect = control;
        searchInput.addEventListener('input', () => {
          const matches = searchIconCatalog(catalog.items, searchInput.value);
          iconSelect.replaceChildren();
          for (const item of matches)
            iconSelect.append(element('option', { value: item.name }, item.name));
          results.textContent = `${matches.length} ${labels.iconResults ?? 'icons found'}`;
          if (matches[0]) {
            iconSelect.value = matches[0].name;
            controller.set(name, matches[0].name);
          }
        });
        searchLabel.append(searchInput, results);
        fieldset.append(searchLabel);
      }
    } else if (spec.type === 'boolean') {
      control = element('input', { type: 'checkbox' });
      control.checked = spec.default;
    } else {
      control = element('input', { type: spec.type === 'number' ? 'number' : 'text' });
      if (spec.default !== undefined) control.value = String(spec.default);
    }
    control.dataset.prop = name;
    control.title = spec.description;
    control.addEventListener('input', () => {
      const input = control as HTMLInputElement;
      const value =
        input.type === 'checkbox'
          ? input.checked
          : input.type === 'number'
            ? input.value === ''
              ? undefined
              : Number(input.value)
            : spec.type === 'union' &&
                control.value.trim() !== '' &&
                Number.isFinite(Number(control.value))
              ? Number(control.value)
              : control.value;
      controller.set(name, value);
      if (input.type === 'checkbox') input.checked = values[name] === true;
    });
    label.append(control);
    fieldset.append(label);
  }
  fieldset.append(referenceStatus);
  root.append(fieldset);

  // Code tabs.
  const tabs = element('div', { class: 'cosm-playground-code not-content' });
  const tablist = element('div', { role: 'tablist', 'aria-label': labels.code });
  const panels = new Map<
    SnippetTarget,
    { tab: HTMLButtonElement; code: HTMLElement; panel: HTMLElement }
  >();
  for (const item of targets) {
    const tab = element(
      'button',
      {
        type: 'button',
        role: 'tab',
        id: `${id}-tab-${item}`,
        'aria-controls': `${id}-panel-${item}`,
      },
      labels.tabs[item]
    );
    const panel = element('div', {
      role: 'tabpanel',
      id: `${id}-panel-${item}`,
      'aria-labelledby': `${id}-tab-${item}`,
      tabindex: '0',
    });
    const code = element('code');
    const pre = element('pre');
    pre.append(code);
    panel.append(pre);
    tab.addEventListener('click', () => controller.select(item));
    tablist.append(tab);
    panels.set(item, { tab, code, panel });
  }
  tablist.addEventListener('keydown', event => {
    const index = targets.indexOf(controller.selected);
    const next =
      event.key === 'ArrowRight'
        ? targets[(index + 1) % targets.length]
        : event.key === 'ArrowLeft'
          ? targets[(index - 1 + targets.length) % targets.length]
          : event.key === 'Home'
            ? targets[0]
            : event.key === 'End'
              ? targets[targets.length - 1]
              : undefined;
    if (!next) return;
    event.preventDefault();
    controller.select(next);
    panels.get(next)?.tab.focus();
  });
  const copy = element('button', { type: 'button', class: 'cosm-playground-copy' }, labels.copy);
  const status = element('span', { role: 'status', class: 'cosm-playground-status' });
  copy.addEventListener('click', async () => {
    try {
      if (!clipboard) throw new Error('Clipboard unavailable');
      await clipboard.writeText(controller.code());
      status.textContent = labels.copied;
    } catch {
      status.textContent = labels.copyFailed;
    }
  });
  const header = element('div', { class: 'cosm-playground-code-header' });
  header.append(tablist, copy, status);
  tabs.append(header, ...[...panels.values()].map(item => item.panel));
  root.append(tabs);

  if (options.nativeDemoUrl) {
    const link = element(
      'a',
      { href: options.nativeDemoUrl, class: 'cosm-playground-native' },
      labels.nativeDemo
    );
    root.append(link);
  }

  let selected: SnippetTarget = targets[0] ?? 'html';
  let snippets = generateSnippets(contract, values, options.content);

  const render = () => {
    snippets = generateSnippets(contract, values, options.content);
    for (const [item, { tab, code, panel }] of panels) {
      const active = item === selected;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      panel.hidden = !active;
      code.textContent = snippets[item] ?? '';
    }
  };

  const controller: PlaygroundController = {
    values,
    get selected() {
      return selected;
    },
    set(name, value) {
      const spec = contract.props[name];
      const onWeb = spec && (!spec.platforms || spec.platforms.includes('web'));
      if (contract.name === 'icon') {
        const label = name === 'label' ? value : values.label;
        const decorative = name === 'decorative' ? value : values.decorative;
        if (decorative === false && (typeof label !== 'string' || !label.trim())) {
          referenceStatus.textContent =
            labels.iconLabelRequired ?? 'Enter a label before making the icon informative.';
          return;
        }
        const invalidSize =
          name === 'size' &&
          !(typeof value === 'number' && Number.isFinite(value) && value > 0) &&
          value !== 'sm' &&
          value !== 'md' &&
          value !== 'lg';
        const invalidWidth =
          name === 'strokeWidth' &&
          !(typeof value === 'number' && Number.isFinite(value) && value >= 0);
        const invalidPaint =
          (name === 'stroke' || name === 'fill') &&
          (typeof value !== 'string' ||
            !value.trim() ||
            /url\s*\(|javascript:|[;{}\\]/i.test(value) ||
            [...value].some(character => character.charCodeAt(0) < 32) ||
            !isPortablePaint(value) ||
            (typeof CSS !== 'undefined' &&
              typeof CSS.supports === 'function' &&
              !CSS.supports('fill', value)));
        if (invalidSize || invalidWidth || invalidPaint) {
          referenceStatus.textContent =
            labels.iconInvalid ?? 'Enter a valid size, stroke width or paint.';
          return;
        }
        referenceStatus.textContent = '';
      }
      const catalog =
        spec?.type === 'reference' ? options.referenceCatalogs?.[spec.reference] : undefined;
      if (catalog && typeof value === 'string') {
        const request = ++referenceRequest;
        referenceStatus.textContent = labels.iconLoading ?? 'Loading icon…';
        catalog
          .load(value)
          .then(resolved => {
            if (request !== referenceRequest) return;
            if (target && onWeb) Reflect.set(target, name, resolved);
            values[name] = value;
            referenceStatus.textContent = '';
            render();
          })
          .catch(() => {
            if (request === referenceRequest)
              referenceStatus.textContent = labels.iconError ?? 'Could not load the selected icon.';
          });
        return;
      }
      values[name] = value;
      if (target && onWeb) {
        const resolved =
          spec?.type === 'reference' && typeof value === 'string'
            ? options.referenceValues?.[spec.reference]?.[value]
            : (value ?? (spec && 'default' in spec ? spec.default : undefined));
        if (spec?.type === 'reference' && resolved === undefined) {
          throw new Error(
            `No playground value configured for ${spec.reference} "${String(value)}".`
          );
        }
        Reflect.set(target, name, resolved);
        if (spec?.type === 'boolean') target.toggleAttribute(toAttribute(name), value === true);
      }
      status.textContent = '';
      render();
    },
    select(next) {
      if (!targets.includes(next) || next === selected) {
        render();
        return;
      }
      selected = next;
      storage?.setItem(TAB_STORAGE_KEY, next);
      document.dispatchEvent(new CustomEvent(TAB_EVENT, { detail: next }));
      status.textContent = '';
      render();
    },
    code(item = selected) {
      return snippets[item] ?? '';
    },
  };

  const remembered = storage?.getItem(TAB_STORAGE_KEY) as SnippetTarget | null | undefined;
  if (remembered && targets.includes(remembered)) selected = remembered;
  document.addEventListener(TAB_EVENT, event => {
    const next = (event as CustomEvent<SnippetTarget>).detail;
    if (next !== selected && targets.includes(next)) {
      selected = next;
      render();
    }
  });
  render();
  for (const [name, spec] of Object.entries(contract.props)) {
    if (spec.type === 'reference' && spec.example && options.referenceCatalogs?.[spec.reference])
      controller.set(name, spec.example);
  }
  return controller;
}
