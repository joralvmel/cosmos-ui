import {
  type ComponentContract,
  type ControlValues,
  generateSnippets,
  type SnippetTarget,
  snippetTargets,
  supportsTarget,
  toAttribute,
} from '@joralvmel/cosmos-core';

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
  tabs: Record<SnippetTarget, string>;
}

export interface PlaygroundOptions {
  contract: ComponentContract;
  content: string;
  labels: PlaygroundLabels;
  themes: readonly { name: string; label: string }[];
  /** Link to the screen of the component in the native demo app (optional). */
  nativeDemoUrl?: string | undefined;
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
  for (const [name, spec] of Object.entries(contract.props)) values[name] = spec.default;

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
  for (const [name, spec] of Object.entries(contract.props)) {
    const label = element('label');
    label.append(element('span', {}, name));
    let control: HTMLInputElement | HTMLSelectElement;
    if (spec.type === 'enum') {
      control = element('select');
      for (const value of spec.values) {
        const option = element('option', { value }, value);
        option.selected = value === spec.default;
        control.append(option);
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
            : control.value;
      controller.set(name, value);
    });
    label.append(control);
    fieldset.append(label);
  }
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
      values[name] = value;
      const spec = contract.props[name];
      const onWeb = spec && (!spec.platforms || spec.platforms.includes('web'));
      if (target && onWeb) {
        Reflect.set(target, name, value ?? spec?.default);
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
  return controller;
}
