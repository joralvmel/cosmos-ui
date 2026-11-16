import {
  type ComponentContract,
  type ControlValues,
  generateSnippets,
  type SnippetTarget,
  snippetTargets,
  supportsTarget,
  toAttribute,
} from '@joralvmel/cosmos-core';
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
  iconGallery?: string;
  iconMore?: string;
  iconPreviewError?: string;
  iconCategory?: string;
  iconAllCategories?: string;
  iconPreviewSize?: string;
  iconStyle?: string;
  iconStroke?: string;
  iconFill?: string;
  iconInherited?: string;
  iconOutline?: string;
  iconFilled?: string;
  iconFillNote?: string;
  iconSelected?: string;
  iconCategories?: Readonly<Record<string, string>>;
  highlightError?: string;
  advanced?: string;
  none?: string;
  customSize?: string;
  customHeight?: string;
  textFieldInvalid?: string;
  textFieldDefaults?: {
    label: string;
    clearLabel: string;
    revealPasswordLabel: string;
    hidePasswordLabel: string;
  };
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
        search: (query: string) => readonly { name: string }[];
        load: (name: string) => Promise<unknown>;
        preview?: (name: string) => Promise<HTMLElement>;
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
    values[name] =
      spec.type === 'reference'
        ? contract.name === 'text-field'
          ? undefined
          : spec.example
        : spec.default;
  }
  if (contract.name === 'text-field' && labels.textFieldDefaults) {
    Object.assign(values, labels.textFieldDefaults);
  }
  if (target) {
    for (const [name, spec] of Object.entries(contract.props)) {
      if (spec.type === 'reference') {
        const selected = values[name];
        if (typeof selected !== 'string') continue;
        const sample = options.referenceValues?.[spec.reference]?.[selected];
        if (sample === undefined && !options.referenceCatalogs?.[spec.reference]) {
          throw new Error(
            `No playground value configured for ${spec.reference} "${spec.example}".`
          );
        }
        if (sample !== undefined) Reflect.set(target, name, sample);
        continue;
      }
      if (values[name] !== undefined) Reflect.set(target, name, values[name]);
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
  const advanced = element('details', { class: 'cosm-playground-advanced' });
  advanced.append(element('summary', {}, labels.advanced ?? 'Advanced options'));
  const advancedControls = element('div', { class: 'cosm-playground-advanced-controls' });
  advanced.append(advancedControls);
  const basicFieldProps = new Set([
    'label',
    'placeholder',
    'type',
    'variant',
    'size',
    'inputMode',
    'required',
    'disabled',
    'readOnly',
    'invalid',
    'clearable',
    'passwordReveal',
    'startIcon',
    'endIcon',
  ]);
  const customHeightLabel = element('label');
  customHeightLabel.append(element('span', {}, labels.customHeight ?? 'Custom minimum height'));
  const customHeight = element('input', { type: 'number', min: '1', step: 'any', value: '56' });
  customHeightLabel.append(customHeight);
  customHeightLabel.hidden = true;
  const referenceStatus = element('span', { role: 'status', 'aria-live': 'polite' });
  let referenceRequest = 0;
  const refreshCatalogs: (() => void)[] = [];
  let iconToolbar: HTMLDivElement | undefined;
  for (const [name, spec] of Object.entries(contract.props)) {
    if (iconToolbar && name === 'size') continue;
    const paintLabel =
      contract.name === 'icon' && name === 'stroke'
        ? (labels.iconStroke ?? 'Outline color (stroke)')
        : contract.name === 'icon' && name === 'fill'
          ? (labels.iconFill ?? 'Fill color (fill)')
          : name;
    if (iconToolbar && (name === 'stroke' || name === 'fill')) {
      const color = select(
        paintLabel,
        [
          ['currentColor', labels.iconInherited ?? 'Inherited (currentColor)'],
          ['none', labels.none ?? 'None'],
          ...semanticColors.map(
            token => [`var(--cosm-${token})`, `--cosm-${token}`] as [string, string]
          ),
        ],
        String(values[name])
      );
      color.control.dataset.prop = name;
      color.control.title = spec.description;
      color.control.addEventListener('change', () => controller.set(name, color.control.value));
      refreshCatalogs.push(() => {
        const value = String(values[name]);
        if (![...color.control.options].some(option => option.value === value))
          color.control.append(element('option', { value }, value));
        color.control.value = value;
      });
      iconToolbar.append(color.wrapper);
      continue;
    }
    const label = element('label');
    label.append(element('span', {}, paintLabel));
    let control: HTMLInputElement | HTMLSelectElement;
    const unionChoices =
      spec.type === 'union'
        ? spec.variants.flatMap(variant => (variant.type === 'enum' ? variant.values : []))
        : [];
    const fieldSize = contract.name === 'text-field' && name === 'size';
    const enumUnion =
      spec.type === 'union' && spec.variants.every(variant => variant.type === 'enum');
    if (spec.type === 'enum' || spec.type === 'reference' || fieldSize || enumUnion) {
      control = element('select');
      const catalog =
        spec.type === 'reference' ? options.referenceCatalogs?.[spec.reference] : undefined;
      if (catalog?.preview) label.hidden = true;
      const choices = catalog
        ? catalog.items.map(item => item.name)
        : spec.type === 'enum'
          ? spec.values
          : spec.type === 'reference'
            ? (spec.options ?? [])
            : unionChoices;
      if (contract.name === 'text-field' && (spec.type === 'reference' || enumUnion)) {
        control.append(element('option', { value: '' }, labels.none ?? 'None'));
      }
      for (const value of choices) {
        const option = element('option', { value }, value);
        option.selected = value === values[name];
        control.append(option);
      }
      if (fieldSize) {
        control.append(element('option', { value: 'custom' }, labels.customSize ?? 'Custom'));
      }
      if (catalog) {
        const catalogControls = element('div', { class: 'cosm-icon-toolbar' });
        if (contract.name === 'icon') iconToolbar = catalogControls;
        const searchLabel = element('label');
        searchLabel.append(element('span', {}, labels.iconSearch ?? 'Search icons'));
        const searchInput = element('input', { type: 'search' });
        const results = element(
          'span',
          { id: `${id}-${name}-results`, role: 'status', 'aria-live': 'polite' },
          `${choices.length} ${labels.iconResults ?? 'icons found'}`
        );
        searchInput.setAttribute('aria-describedby', results.id);
        const iconSelect = control;
        const gallery = element('div', {
          class: 'cosm-icon-gallery',
          role: 'group',
          'aria-label': labels.iconGallery ?? 'Icon gallery',
        });
        const more = element(
          'button',
          { type: 'button', class: 'cosm-icon-more' },
          labels.iconMore ?? 'Show more icons'
        );
        let matches: readonly { name: string }[] = catalog.items;
        let shown = 0;
        const category = select(
          labels.iconCategory ?? 'Category',
          [
            ['', labels.iconAllCategories ?? 'All categories'],
            ...[...new Set(catalog.items.map(item => item.category))]
              .sort()
              .map(value => [value, labels.iconCategories?.[value] ?? value] as [string, string]),
          ],
          ''
        );
        category.control.dataset.iconCategory = '';
        const size = select(
          labels.iconPreviewSize ?? 'Preview size',
          [
            ...['16', '20', '24', '32', '48'].map(
              value => [value, `${value} px`] as [string, string]
            ),
            ['custom', labels.customSize ?? 'Custom'],
          ],
          '20'
        );
        size.control.dataset.iconSize = '';
        size.control.dataset.prop = 'size';
        const customSize = element('input', {
          type: 'number',
          min: '1',
          step: 'any',
          value: '32',
          'data-icon-custom-size': '',
          'aria-label': `${labels.customSize ?? 'Custom'} (px)`,
        });
        customSize.hidden = true;
        const sizeGroup = element('div', { class: 'cosm-icon-size' });
        sizeGroup.append(size.wrapper, customSize);
        const style = select(
          labels.iconStyle ?? 'Style',
          [
            ['outline', labels.iconOutline ?? 'Outline'],
            ['filled', labels.iconFilled ?? 'Filled paths'],
          ],
          'outline'
        );
        style.control.dataset.iconStyle = '';
        const previewSize = () =>
          typeof values.size === 'number'
            ? values.size
            : values.size === 'sm'
              ? 16
              : values.size === 'lg'
                ? 24
                : 20;
        const paintPreviews = () => {
          const iconSize = previewSize();
          for (const icon of gallery.querySelectorAll('cosm-icon')) {
            icon.size = iconSize;
            icon.fill = String(values.fill ?? 'none');
            icon.stroke = String(values.stroke ?? 'currentColor');
            icon.strokeWidth = Number(values.strokeWidth ?? 2);
          }
        };
        refreshCatalogs.push(() => {
          const value = String(previewSize());
          const custom =
            size.control.value === 'custom' ||
            ![...size.control.options].some(option => option.value === value);
          size.control.value = custom ? 'custom' : value;
          customSize.hidden = !custom;
          if (custom) customSize.value = value;
          style.control.value = values.fill === 'none' ? 'outline' : 'filled';
          paintPreviews();
        });
        size.control.addEventListener('change', () => {
          controller.set(
            'size',
            Number(size.control.value === 'custom' ? customSize.value : size.control.value)
          );
        });
        customSize.addEventListener('input', () => {
          controller.set('size', Number(customSize.value));
        });
        style.control.addEventListener('change', () => {
          controller.set('fill', style.control.value === 'filled' ? 'currentColor' : 'none');
        });
        const appendPreviews = () => {
          const next = matches.slice(shown, shown + 24);
          shown += next.length;
          more.hidden = shown >= matches.length;
          for (const item of next) {
            const button = element('button', {
              type: 'button',
              class: 'cosm-icon-choice',
              'data-icon-name': item.name,
              'aria-pressed': String(values[name] === item.name),
            });
            const thumbnail = element('span', { 'aria-hidden': 'true' });
            button.append(thumbnail, element('span', {}, item.name));
            button.addEventListener('click', () => {
              iconSelect.value = item.name;
              controller.set(name, item.name);
            });
            gallery.append(button);
            catalog
              .preview?.(item.name)
              .then(node => {
                thumbnail.replaceChildren(node);
                paintPreviews();
              })
              .catch(() => {
                thumbnail.textContent = labels.iconPreviewError ?? 'Preview unavailable';
                button.title = thumbnail.textContent;
              });
          }
        };
        more.addEventListener('click', appendPreviews);
        const filter = () => {
          const names = new Set(
            catalog.items
              .filter(item => !category.control.value || item.category === category.control.value)
              .map(item => item.name)
          );
          matches = catalog.search(searchInput.value).filter(item => names.has(item.name));
          iconSelect.replaceChildren();
          for (const item of matches)
            iconSelect.append(element('option', { value: item.name }, item.name));
          results.textContent = `${matches.length} ${labels.iconResults ?? 'icons found'}`;
          if (catalog.preview) {
            gallery.replaceChildren();
            shown = 0;
            appendPreviews();
          }
          if (matches[0]) {
            iconSelect.value = matches[0].name;
            controller.set(name, matches[0].name);
          }
        };
        searchInput.addEventListener('input', filter);
        category.control.addEventListener('change', filter);
        searchLabel.append(searchInput);
        catalogControls.append(searchLabel, category.wrapper, sizeGroup, style.wrapper);
        fieldset.append(
          catalogControls,
          results,
          element('p', { class: 'cosm-icon-note', 'data-icon-selection': '' }),
          element(
            'p',
            { class: 'cosm-icon-note' },
            labels.iconFillNote ??
              'Filled paths use SVG fill; this is not a designed solid icon set.'
          )
        );
        if (catalog.preview) {
          appendPreviews();
          fieldset.append(gallery, more);
        }
      }
    } else if (spec.type === 'boolean') {
      control = element('input', { type: 'checkbox' });
      control.checked = spec.default;
    } else {
      control = element('input', { type: spec.type === 'number' ? 'number' : 'text' });
      if (values[name] !== undefined) control.value = String(values[name]);
    }
    control.dataset.prop = name;
    control.title = spec.description;
    control.addEventListener('input', () => {
      const input = control as HTMLInputElement;
      if (fieldSize) {
        customHeightLabel.hidden = control.value !== 'custom';
        controller.set(
          name,
          control.value === 'custom' ? Number(customHeight.value) : control.value
        );
        return;
      }
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
              : contract.name === 'text-field' &&
                  (spec.type === 'reference' || enumUnion) &&
                  control.value === ''
                ? undefined
                : control.value;
      controller.set(name, value);
      if (input.type === 'checkbox') input.checked = values[name] === true;
    });
    label.append(control);
    if (
      (contract.name === 'text-field' && !basicFieldProps.has(name)) ||
      (contract.name === 'icon' && !['icon', 'stroke', 'fill'].includes(name))
    )
      advancedControls.append(label);
    else fieldset.append(label);
    if (fieldSize) fieldset.append(customHeightLabel);
  }
  customHeight.addEventListener('input', () => {
    controller.set('size', Number(customHeight.value));
  });
  if (contract.name === 'text-field' || contract.name === 'icon') fieldset.append(advanced);
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
  let highlightRequest = 0;

  const render = () => {
    snippets = generateSnippets(contract, values, options.content);
    for (const refresh of refreshCatalogs) refresh();
    const selection = root.querySelector('[data-icon-selection]');
    if (selection)
      selection.textContent = `${labels.iconSelected ?? 'Selected icon'}: ${values.icon}`;
    for (const button of fieldset.querySelectorAll<HTMLElement>('[data-icon-name]')) {
      button.setAttribute('aria-pressed', String(button.dataset.iconName === values.icon));
    }
    for (const [item, { tab, code, panel }] of panels) {
      const active = item === selected;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      panel.hidden = !active;
      code.textContent = snippets[item] ?? '';
    }
    const activeCode = panels.get(selected)?.code;
    const source = snippets[selected] ?? '';
    const request = ++highlightRequest;
    if (activeCode) {
      import('./highlight')
        .then(({ highlightCode }) => {
          if (request === highlightRequest) return highlightCode(activeCode, source, selected);
        })
        .catch(error => {
          console.error('Could not highlight playground code.', error);
          if (request === highlightRequest)
            status.textContent =
              labels.highlightError ?? 'Highlighting unavailable; code can still be copied.';
        });
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
      if (contract.name === 'text-field') {
        const invalidSize =
          name === 'size' &&
          value !== 'sm' &&
          value !== 'md' &&
          value !== 'lg' &&
          !(typeof value === 'number' && Number.isFinite(value) && value > 0);
        const actionLabels = ['clearLabel', 'revealPasswordLabel', 'hidePasswordLabel'];
        const invalidLabel =
          (name === 'label' || actionLabels.includes(name)) &&
          (typeof value !== 'string' || !value.trim());
        const invalidLength =
          (name === 'minLength' || name === 'maxLength') &&
          value !== undefined &&
          !(typeof value === 'number' && Number.isInteger(value) && value >= 0);
        if (invalidSize || invalidLabel || invalidLength) {
          referenceStatus.textContent =
            labels.textFieldInvalid ?? 'Enter a non-empty label or a valid positive size/length.';
          return;
        }
        referenceStatus.textContent = '';
      }
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
        if (contract.name === 'text-field' && name === 'value') {
          Reflect.set(target, 'valueControlled', value !== undefined);
        }
        const resolved =
          spec?.type === 'reference' && typeof value === 'string'
            ? options.referenceValues?.[spec.reference]?.[value]
            : (value ?? (spec && 'default' in spec ? spec.default : undefined));
        if (spec?.type === 'reference' && value !== undefined && resolved === undefined) {
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
    if (
      spec.type === 'reference' &&
      typeof values[name] === 'string' &&
      options.referenceCatalogs?.[spec.reference]
    )
      controller.set(name, values[name]);
  }
  return controller;
}
