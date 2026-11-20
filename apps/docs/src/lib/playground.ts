import {
  type ComponentContract,
  type ControlValues,
  getListboxOptions,
  type ListboxItem,
  type ListboxSelectionChangeDetail,
  listboxValueExamples,
  type SnippetTarget,
  snippetTargets,
  supportsTarget,
  toAttribute,
  validateListboxSize,
  validateListboxValues,
  validateSize,
} from '@joralvmel/cosmos-core';
import '@joralvmel/cosmos-elements/button';
import '@joralvmel/cosmos-elements/switch';
import '@joralvmel/cosmos-elements/text-field';
import { semanticColors } from '@joralvmel/cosmos-tokens';
import { type PlaygroundChild, playgroundSnippets } from './playground-snippets';
import { SITE_THEME_KEY } from './theme';

export { SITE_THEME_KEY } from './theme';

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
  iconButtonLabel?: string;
  iconButtonInvalid?: string;
  popoverCloseLabel?: string;
  popoverInvalid?: string;
  checkboxLabel?: string;
  textareaLabel?: string;
  textareaInvalid?: string;
  switchLabel?: string;
  switchInvalid?: string;
  listboxLabel?: string;
  radioGroupLabel?: string;
  radioGroupExamples?: Record<string, string>;
  radioGroupCustomSize?: string;
  radioGroupSizeInvalid?: string;
  radioGroupInvalid?: string;
  listboxInvalid?: string;
  selectLabel?: string;
  selectPlaceholder?: string;
  selectClearLabel?: string;
  selectValues?: Readonly<Record<string, string>>;
  selectInvalid?: string;
  listboxSelected?: string;
  listboxProposal?: string;
  listboxResetNote?: string;
  autonomous?: string;
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
  child?: PlaygroundChild;
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
  let target = root.querySelector<HTMLElement>('[data-playground-target]');
  const targets = snippetTargets.filter(item => supportsTarget(contract, item));
  const values: ControlValues = {};
  for (const [name, spec] of Object.entries(contract.props)) {
    values[name] =
      spec.type === 'reference'
        ? spec.required && !contract.states.some(state => state.prop === name)
          ? spec.example
          : undefined
        : spec.default;
  }
  for (const state of contract.states) {
    if (contract.props[state.prop]?.type === 'boolean') values[state.prop] = undefined;
  }
  if (contract.name === 'text-field' && labels.textFieldDefaults) {
    Object.assign(values, labels.textFieldDefaults);
  }
  if (contract.name === 'icon-button') {
    values.label = labels.iconButtonLabel ?? 'Favorite';
  }
  if (contract.name === 'popover') {
    values.closeLabel = labels.popoverCloseLabel ?? 'Close';
  }
  if (contract.name === 'checkbox') {
    values.label = labels.checkboxLabel ?? 'Accept terms';
  }
  if (contract.name === 'textarea') {
    values.label = labels.textareaLabel ?? 'Message';
  }
  if (contract.name === 'switch') {
    values.label = labels.switchLabel ?? 'Enable notifications';
  }
  if (contract.name === 'listbox') {
    values.label = labels.listboxLabel ?? 'Choose produce';
  }
  if (contract.name === 'radio-group') {
    values.label = labels.radioGroupLabel ?? 'Contact method';
  }
  if (contract.name === 'select') {
    values.label = labels.selectLabel ?? 'Fruit';
    values.placeholder = labels.selectPlaceholder ?? 'Choose a fruit';
    values.clearLabel = labels.selectClearLabel ?? 'Clear selection';
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

  const themeAttributes = () => ({
    'data-cosm-preview': '',
    'data-theme': preview?.dataset.theme ?? storage?.getItem(SITE_THEME_KEY) ?? 'cosmos',
    'data-mode':
      preview?.dataset.mode ??
      (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'),
  });

  // Theme and mode of the preview and its controls.
  if (preview) {
    const toolbar = element('div', {
      class: 'cosm-playground-toolbar',
      ...themeAttributes(),
    });
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
      for (const surface of root.querySelectorAll<HTMLElement>('[data-cosm-preview]')) {
        if (theme.control.value) {
          surface.setAttribute('data-fixed', '');
          surface.dataset.theme = theme.control.value;
        } else {
          surface.removeAttribute('data-fixed');
          surface.dataset.theme = storage?.getItem(SITE_THEME_KEY) ?? options.themes[0]?.name ?? '';
        }
      }
    });
    mode.control.addEventListener('change', () => {
      for (const surface of root.querySelectorAll<HTMLElement>('[data-cosm-preview]')) {
        if (mode.control.value) {
          surface.setAttribute('data-fixed-mode', '');
          surface.dataset.mode = mode.control.value;
        } else {
          surface.removeAttribute('data-fixed-mode');
          surface.dataset.mode =
            document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
        }
      }
    });
    toolbar.append(theme.wrapper, mode.wrapper);
    root.insertBefore(toolbar, preview);
  }

  // Controls generated from the contract.
  const fieldset = element('fieldset', {
    class: 'cosm-playground-controls not-content',
    ...themeAttributes(),
  });
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
  const radioGroup = contract.name === 'radio-group';
  customHeightLabel.append(
    element(
      'span',
      {},
      radioGroup
        ? (labels.radioGroupCustomSize ?? 'Custom indicator size (px)')
        : (labels.customHeight ?? 'Custom minimum height')
    )
  );
  const customHeight = element('input', {
    type: 'number',
    min: radioGroup ? '0' : '1',
    step: 'any',
    value: radioGroup ? '28' : '56',
  });
  if (radioGroup) customHeight.dataset.radioGroupCustomSize = '';
  customHeightLabel.append(customHeight);
  customHeightLabel.hidden = true;
  const referenceStatus = element('span', { role: 'status', 'aria-live': 'polite' });
  let referenceRequest = 0;
  const refreshControls: (() => void)[] = [];
  let iconToolbar: HTMLDivElement | undefined;
  const appendControl = (name: string, control: HTMLElement) => {
    const container =
      contract.name === 'text-field' && !basicFieldProps.has(name)
        ? advancedControls
        : iconToolbar && name !== 'icon'
          ? iconToolbar
          : fieldset;
    container.append(control);
  };
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
      refreshControls.push(() => {
        const value = String(values[name]);
        if (![...color.control.options].some(option => option.value === value))
          color.control.append(element('option', { value }, value));
        color.control.value = value;
      });
      iconToolbar.append(color.wrapper);
      continue;
    }
    if (spec.type === 'boolean' && !contract.states.some(state => state.prop === name)) {
      const control = element('cosm-switch', { class: 'cosm-playground-boolean-control' });
      control.label = paintLabel;
      control.checked = values[name] === true;
      control.title = spec.description;
      control.dataset.prop = name;
      control.addEventListener('cosm-checked-change', event => {
        controller.set(name, event.detail.checked);
        control.checked = values[name] === true;
      });
      refreshControls.push(() => {
        control.checked = values[name] === true;
      });
      appendControl(name, control);
      continue;
    }
    const unionChoices =
      spec.type === 'union'
        ? spec.variants.flatMap(variant => (variant.type === 'enum' ? variant.values : []))
        : [];
    const fieldSize =
      (contract.name === 'text-field' || contract.name === 'listbox' || radioGroup) &&
      name === 'size';
    const enumUnion =
      spec.type === 'union' && spec.variants.every(variant => variant.type === 'enum');
    if (spec.type === 'string' || (spec.type === 'union' && !enumUnion && !fieldSize)) {
      const control = element('cosm-text-field');
      control.classList.add('cosm-playground-text-control');
      control.label = paintLabel;
      control.value = values[name] === undefined ? '' : String(values[name]);
      control.valueControlled = true;
      control.title = spec.description;
      control.dataset.prop = name;
      control.addEventListener('cosm-change', event => {
        const text = event.detail.value;
        const value =
          spec.type === 'union' && text.trim() !== '' && Number.isFinite(Number(text))
            ? Number(text)
            : text;
        controller.set(name, value);
        control.value = values[name] === undefined ? '' : String(values[name]);
      });
      refreshControls.push(() => {
        control.value = values[name] === undefined ? '' : String(values[name]);
      });
      appendControl(name, control);
      continue;
    }
    const label = element('label');
    label.append(element('span', {}, paintLabel));
    let control: HTMLInputElement | HTMLSelectElement;
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
            ? contract.name === 'radio-group'
              ? Object.keys(options.referenceValues?.[spec.reference] ?? {})
              : (spec.options ?? [])
            : unionChoices;
      const stateReference =
        spec.type === 'reference' && contract.states.some(state => state.prop === name);
      if (
        (spec.type === 'reference' && !spec.required && !stateReference) ||
        (contract.name === 'text-field' && enumUnion)
      ) {
        control.append(element('option', { value: '' }, labels.none ?? 'None'));
      }
      if (stateReference) {
        control.append(element('option', { value: '' }, labels.autonomous ?? 'Autonomous'));
      }
      for (const value of choices) {
        const option = element(
          'option',
          { value },
          contract.name === 'radio-group'
            ? (labels.radioGroupExamples?.[value] ?? value)
            : contract.name === 'select' &&
                spec.type === 'reference' &&
                spec.reference === 'SelectValue'
              ? (labels.selectValues?.[value] ?? value)
              : value
        );
        option.selected = value === values[name];
        control.append(option);
      }
      if (fieldSize) {
        control.append(element('option', { value: 'custom' }, labels.customSize ?? 'Custom'));
      }
      control.value = values[name] === undefined ? '' : String(values[name]);
      if (
        contract.name === 'radio-group' &&
        spec.type === 'reference' &&
        spec.reference === 'RadioGroupValue'
      ) {
        const valueControl = control;
        refreshControls.push(() => {
          const sample = options.referenceValues?.RadioGroupOptions?.[String(values.options)] as
            | readonly { value: string; label: string; disabled?: boolean }[]
            | undefined;
          for (const choice of valueControl.options) {
            if (!choice.value || choice.value === 'none') continue;
            const option = sample?.find(entry => entry.value === choice.value && !entry.disabled);
            choice.hidden = !option;
            choice.disabled = !option;
            if (option) choice.textContent = option.label;
          }
          valueControl.value = String(values[name] ?? '');
        });
      }
      if (
        contract.name === 'select' &&
        spec.type === 'reference' &&
        spec.reference === 'SelectValue'
      ) {
        const valueControl = control;
        refreshControls.push(() => {
          const sample = options.referenceValues?.ListboxItems?.[String(values.items)] as
            | readonly ListboxItem[]
            | undefined;
          const available = sample ? getListboxOptions(sample) : [];
          for (const choice of valueControl.options) {
            if (!choice.value || choice.value === 'none') continue;
            const option = available?.find(
              entry => entry.value === choice.value && !entry.disabled
            );
            choice.hidden = !option;
            choice.disabled = !option;
          }
          const current = String(values[name] ?? '');
          valueControl.value = [...valueControl.options].some(
            option => option.value === current && !option.disabled
          )
            ? current
            : '';
        });
      }
      if (catalog) {
        const catalogControls = element('div', { class: 'cosm-icon-toolbar' });
        if (contract.name === 'icon') iconToolbar = catalogControls;
        const searchInput = element('cosm-text-field', {
          class: 'cosm-playground-text-control',
          'data-icon-search': '',
        });
        searchInput.label = labels.iconSearch ?? 'Search icons';
        searchInput.type = 'search';
        const results = element(
          'span',
          {
            id: `${id}-${name}-results`,
            class: 'sr-only',
            role: 'status',
            'aria-live': 'polite',
          },
          `${choices.length} ${labels.iconResults ?? 'icons found'}`
        );
        searchInput.helpText = results.textContent ?? '';
        const iconSelect = control;
        const gallery = element('div', {
          class: 'cosm-icon-gallery',
          'data-cosm-preview': '',
          'data-theme':
            preview?.dataset.theme ??
            storage?.getItem(SITE_THEME_KEY) ??
            options.themes[0]?.name ??
            'cosmos',
          'data-mode':
            preview?.dataset.mode ??
            (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'),
          role: 'group',
          'aria-label': labels.iconGallery ?? 'Icon gallery',
        });
        const more = element(
          'cosm-button',
          {
            type: 'button',
            variant: 'outline',
            tone: 'neutral',
            size: 'sm',
            class: 'cosm-docs-action-button cosm-icon-more',
          },
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
        refreshControls.push(() => {
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
        more.addEventListener('cosm-press', appendPreviews);
        const filter = () => {
          const names = new Set(
            catalog.items
              .filter(item => !category.control.value || item.category === category.control.value)
              .map(item => item.name)
          );
          matches = catalog.search(searchInput.value ?? '').filter(item => names.has(item.name));
          iconSelect.replaceChildren();
          for (const item of matches)
            iconSelect.append(element('option', { value: item.name }, item.name));
          results.textContent = `${matches.length} ${labels.iconResults ?? 'icons found'}`;
          searchInput.helpText = results.textContent;
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
        searchInput.addEventListener('cosm-change', filter);
        category.control.addEventListener('change', filter);
        catalogControls.append(searchInput, category.wrapper, sizeGroup, style.wrapper);
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
    } else if (spec.type === 'boolean' && contract.states.some(state => state.prop === name)) {
      control = element('select');
      for (const [value, text] of [
        ['', labels.autonomous ?? 'Autonomous'],
        ['false', 'false'],
        ['true', 'true'],
      ] as const) {
        control.append(element('option', { value }, text));
      }
    } else {
      control = element('input', { type: spec.type === 'number' ? 'number' : 'text' });
      if (values[name] !== undefined) control.value = String(values[name]);
      if (contract.name === 'icon' && name === 'strokeWidth') {
        control.min = '0';
        control.step = 'any';
      }
    }
    control.dataset.prop = name;
    control.title = spec.description;
    control.addEventListener('input', () => {
      const input = control;
      if (fieldSize) {
        customHeightLabel.hidden = control.value !== 'custom';
        controller.set(
          name,
          control.value === 'custom' ? Number(customHeight.value) : control.value
        );
        return;
      }
      const value =
        spec.type === 'boolean' && contract.states.some(state => state.prop === name)
          ? input.value === ''
            ? undefined
            : input.value === 'true'
          : input.type === 'number'
            ? input.value === ''
              ? undefined
              : Number(input.value)
            : spec.type === 'union' &&
                control.value.trim() !== '' &&
                Number.isFinite(Number(control.value))
              ? Number(control.value)
              : ((spec.type === 'reference' &&
                    (!spec.required || contract.states.some(state => state.prop === name))) ||
                    (contract.name === 'text-field' && enumUnion)) &&
                  control.value === ''
                ? undefined
                : control.value;
      controller.set(name, value);
    });
    label.append(control);
    if (contract.name === 'text-field' && !basicFieldProps.has(name))
      advancedControls.append(label);
    else if (iconToolbar && name !== 'icon') iconToolbar.append(label);
    else fieldset.append(label);
    if (fieldSize) fieldset.append(customHeightLabel);
  }
  customHeight.addEventListener('input', () => {
    controller.set('size', Number(customHeight.value));
  });
  if (contract.name === 'text-field') fieldset.append(advanced);
  let autonomousSelection: readonly string[] = [];
  let lastProposal: readonly string[] = [];
  const selectionOutput = element('output', {
    'data-listbox-selection': '',
    'aria-live': 'polite',
  });
  const updateSelectionOutput = () => {
    const accepted =
      typeof values.selectedValues === 'string'
        ? (listboxValueExamples[values.selectedValues] ?? [])
        : autonomousSelection;
    selectionOutput.textContent = `${labels.listboxSelected ?? 'Selected'}: ${JSON.stringify(accepted)} · ${labels.listboxProposal ?? 'Last proposal'}: ${JSON.stringify(lastProposal)}`;
  };
  if (contract.name === 'listbox') {
    root.addEventListener('cosm-selection-change', event => {
      const { detail } = event as CustomEvent<ListboxSelectionChangeDetail>;
      lastProposal = detail.selectedValues;
      if (values.selectedValues === undefined) autonomousSelection = detail.selectedValues;
      updateSelectionOutput();
    });
    fieldset.append(
      selectionOutput,
      element(
        'p',
        {},
        labels.listboxResetNote ??
          'Changing mode or initial values resets this preview. A bound selection shows proposals until its owner accepts them.'
      )
    );
    updateSelectionOutput();
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
  const copy = element(
    'cosm-button',
    {
      type: 'button',
      variant: 'outline',
      tone: 'neutral',
      size: 'sm',
      class: 'cosm-docs-action-button cosm-playground-copy',
      ...themeAttributes(),
    },
    labels.copy
  );
  const status = element('span', { role: 'status', class: 'cosm-playground-status' });
  copy.addEventListener('cosm-press', async () => {
    try {
      if (!clipboard) throw new Error('Clipboard unavailable');
      await clipboard.writeText(controller.code());
      status.textContent = labels.copied;
    } catch {
      status.textContent = labels.copyFailed;
    }
  });
  const header = element('div', {
    class: 'cosm-playground-code-header',
    ...themeAttributes(),
  });
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
  let snippets = playgroundSnippets(contract, values, options.content, options.child);
  let highlightRequest = 0;

  const render = () => {
    snippets = playgroundSnippets(contract, values, options.content, options.child);
    for (const refresh of refreshControls) refresh();
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
      if (contract.name === 'listbox' && name === 'locale' && value === '') value = undefined;
      const spec = contract.props[name];
      const onWeb = spec && (!spec.platforms || spec.platforms.includes('web'));
      if (
        contract.name === 'icon-button' &&
        name === 'label' &&
        (typeof value !== 'string' || !value.trim())
      ) {
        referenceStatus.textContent = labels.iconButtonInvalid ?? 'Enter a non-empty label.';
        return;
      }
      referenceStatus.textContent = '';
      if (contract.name === 'listbox') {
        const next = { ...values, [name]: value };
        try {
          if (typeof next.label !== 'string' || !next.label.trim()) {
            throw new TypeError(labels.listboxInvalid ?? 'Enter a non-empty label.');
          }
          if (typeof next.size !== 'string' && typeof next.size !== 'number') {
            throw new TypeError(labels.listboxInvalid ?? 'Enter a positive option height.');
          }
          validateListboxSize(next.size);
          if (next.selectionMode !== 'single' && next.selectionMode !== 'multiple') {
            throw new TypeError('Invalid selection mode.');
          }
          for (const prop of ['selectedValues', 'defaultSelectedValues']) {
            const reference = next[prop];
            if (reference === undefined) continue;
            const selection =
              typeof reference === 'string' ? listboxValueExamples[reference] : undefined;
            if (!selection) throw new TypeError('Unknown selection example.');
            validateListboxValues(selection, next.selectionMode);
          }
          if (next.locale !== undefined) {
            if (typeof next.locale !== 'string') throw new TypeError('Invalid locale.');
            new Intl.Collator(next.locale);
          }
        } catch (error) {
          referenceStatus.textContent = `${labels.listboxInvalid ?? 'Invalid Listbox value.'} ${error instanceof Error ? error.message : String(error)}`;
          return;
        }
      }
      if (contract.name === 'popover') {
        const invalidGap =
          name === 'gap' && !(typeof value === 'number' && Number.isFinite(value) && value >= 0);
        const invalidLabel = name === 'closeLabel' && (typeof value !== 'string' || !value.trim());
        if (invalidGap || invalidLabel) {
          referenceStatus.textContent =
            labels.popoverInvalid ?? 'Use a non-negative distance and a non-empty close label.';
          return;
        }
      }
      if (contract.name === 'text-field' || contract.name === 'switch') {
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
            contract.name === 'switch'
              ? (labels.switchInvalid ?? 'Use a non-empty label and a positive size.')
              : (labels.textFieldInvalid ??
                'Enter a non-empty label or a valid positive size/length.');
          return;
        }
        referenceStatus.textContent = '';
      }
      if (contract.name === 'textarea') {
        const nextRows = name === 'rows' ? value : values.rows;
        const nextMaxLength = name === 'maxLength' ? value : values.maxLength;
        const nextLabel = name === 'label' ? value : values.label;
        const invalidLabel = typeof nextLabel !== 'string' || !nextLabel.trim();
        const invalidRows =
          typeof nextRows !== 'number' || !Number.isInteger(nextRows) || nextRows < 1;
        const invalidLength =
          nextMaxLength !== undefined &&
          (typeof nextMaxLength !== 'number' ||
            !Number.isInteger(nextMaxLength) ||
            nextMaxLength < 0);
        if (invalidLabel || invalidRows || invalidLength) {
          referenceStatus.textContent =
            labels.textareaInvalid ??
            'Use a non-empty label, positive row count and nonnegative whole maximum length.';
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
      if (contract.name === 'radio-group') {
        const label = name === 'label' ? value : values.label;
        if (typeof label !== 'string' || !label.trim()) {
          referenceStatus.textContent =
            labels.radioGroupInvalid ?? 'Enter a non-empty group label.';
          return;
        }
        if (name === 'size') {
          try {
            validateSize(value, 'RadioGroup');
          } catch (error) {
            if (!(error instanceof TypeError)) throw error;
            referenceStatus.textContent = labels.radioGroupSizeInvalid ?? error.message;
            return;
          }
        }
        referenceStatus.textContent = '';
      }
      if (contract.name === 'select') {
        const next = { ...values, [name]: value };
        const label = name === 'label' ? value : next.label;
        const placeholder = name === 'placeholder' ? value : next.placeholder;
        const clearable = name === 'clearable' ? value : next.clearable;
        const clearLabel = name === 'clearLabel' ? value : next.clearLabel;
        if (
          typeof label !== 'string' ||
          !label.trim() ||
          typeof placeholder !== 'string' ||
          !placeholder.trim() ||
          (clearable === true && (typeof clearLabel !== 'string' || !clearLabel.trim()))
        ) {
          referenceStatus.textContent =
            labels.selectInvalid ??
            'Use a non-empty label, placeholder, and clear label when clearable.';
          return;
        }
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
      if (contract.name === 'select' && name === 'items') {
        const sample = options.referenceValues?.ListboxItems?.[String(value)] as
          | readonly ListboxItem[]
          | undefined;
        const available = new Set(
          (sample ? getListboxOptions(sample) : []).map(option => option.value)
        );
        for (const prop of ['value', 'defaultValue']) {
          const current = values[prop];
          if (typeof current === 'string' && current !== 'none' && !available.has(current)) {
            values[prop] = undefined;
          }
        }
      }
      if (contract.name === 'radio-group' && name === 'options') {
        values.value = undefined;
        values.defaultValue = undefined;
      }
      if (
        target &&
        ((contract.name === 'popover' && name === 'defaultOpen') ||
          (contract.name === 'listbox' &&
            (name === 'selectionMode' || name === 'defaultSelectedValues')) ||
          (contract.name === 'radio-group' && (name === 'defaultValue' || name === 'options')) ||
          (contract.name === 'select' && name === 'items'))
      ) {
        const replacement = document.createElement(contract.tag);
        for (const attribute of target.attributes) {
          if (attribute.name !== 'open') replacement.setAttribute(attribute.name, attribute.value);
        }
        while (target.firstChild) replacement.append(target.firstChild);
        for (const [prop, current] of Object.entries(values)) {
          const propSpec = contract.props[prop];
          const resolved =
            propSpec?.type === 'reference' && typeof current === 'string'
              ? options.referenceValues?.[propSpec.reference]?.[current]
              : current;
          if (resolved !== undefined) Reflect.set(replacement, prop, resolved);
        }
        target.replaceWith(replacement);
        target = replacement;
        if (contract.name === 'listbox') {
          autonomousSelection =
            typeof values.defaultSelectedValues === 'string'
              ? (listboxValueExamples[values.defaultSelectedValues] ?? [])
              : [];
          lastProposal = [];
        }
      }
      if (target && onWeb) {
        if (contract.name === 'icon-button' && name === 'pressed') {
          Reflect.set(target, 'pressedControlled', value !== undefined);
        }
        if (contract.name === 'text-field' && name === 'value') {
          Reflect.set(target, 'valueControlled', value !== undefined);
        }
        if (contract.name === 'listbox' && name === 'selectedValues') {
          Reflect.set(target, 'selectedValuesControlled', value !== undefined);
        }
        if (contract.name === 'radio-group' && name === 'value') {
          Reflect.set(target, 'valueControlled', value !== undefined);
        }
        if (contract.name === 'select' && name === 'value') {
          Reflect.set(target, 'valueControlled', value !== undefined);
        }
        const resolved =
          spec?.type === 'reference' && typeof value === 'string'
            ? options.referenceValues?.[spec.reference]?.[value]
            : spec?.type === 'boolean' && contract.states.some(state => state.prop === name)
              ? value
              : (value ?? (spec && 'default' in spec ? spec.default : undefined));
        if (spec?.type === 'reference' && value !== undefined && resolved === undefined) {
          throw new Error(
            `No playground value configured for ${spec.reference} "${String(value)}".`
          );
        }
        Reflect.set(target, name, resolved);
        if (spec?.type === 'boolean' && !contract.states.some(state => state.prop === name))
          target.toggleAttribute(toAttribute(name), value === true);
      }
      status.textContent = '';
      if (contract.name === 'listbox') updateSelectionOutput();
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
