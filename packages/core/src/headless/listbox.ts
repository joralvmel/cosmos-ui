import type { ListboxItem, ListboxOption, ListboxSelectionMode } from '../specs/listbox.js';
import { validateSize } from './size.js';

export function getListboxOptions<Icon>(
  items: readonly ListboxItem<Icon>[]
): readonly ListboxOption<Icon>[] {
  if (!Array.isArray(items)) throw new TypeError('Listbox items must be an array.');
  const options: ListboxOption<Icon>[] = [];
  const values = new Set<string>();
  const append = (option: ListboxOption<Icon>) => {
    if (
      !option ||
      typeof option.value !== 'string' ||
      !option.value.trim() ||
      typeof option.label !== 'string' ||
      !option.label.trim()
    ) {
      throw new TypeError('Listbox options require nonempty value and label strings.');
    }
    if (values.has(option.value)) throw new TypeError('Listbox option values must be unique.');
    if (option.description !== undefined && typeof option.description !== 'string') {
      throw new TypeError('Listbox descriptions must be strings.');
    }
    if (option.disabled !== undefined && typeof option.disabled !== 'boolean') {
      throw new TypeError('Listbox option disabled must be a boolean.');
    }
    values.add(option.value);
    options.push(option);
  };
  for (const item of items) {
    if (!item || typeof item !== 'object') throw new TypeError('Listbox items must be objects.');
    if ('options' in item) {
      if (
        typeof item.label !== 'string' ||
        !item.label.trim() ||
        !Array.isArray(item.options) ||
        item.options.length === 0
      ) {
        throw new TypeError('Listbox groups require a nonempty label and options array.');
      }
      for (const option of item.options) append(option);
    } else {
      append(item);
    }
  }
  return options;
}

export function validateListboxValues(
  values: readonly string[],
  selectionMode: ListboxSelectionMode
): void {
  if (selectionMode !== 'single' && selectionMode !== 'multiple') {
    throw new TypeError('Listbox selectionMode must be single or multiple.');
  }
  if (
    !Array.isArray(values) ||
    values.some(value => typeof value !== 'string' || !value.trim()) ||
    new Set(values).size !== values.length ||
    (selectionMode === 'single' && values.length > 1)
  ) {
    throw new TypeError(
      'Listbox selected values must be unique nonempty strings matching the mode.'
    );
  }
}

export function validateListboxSize(size: string | number): void {
  validateSize(size, 'Listbox');
}

export function getListboxInitialActive(
  options: readonly ListboxOption[],
  selectedValues: readonly string[]
): string | null {
  return (
    options.find(option => !option.disabled && selectedValues.includes(option.value))?.value ??
    options.find(option => !option.disabled)?.value ??
    null
  );
}

export function moveListboxActive(
  options: readonly ListboxOption[],
  activeValue: string | null,
  key: 'ArrowDown' | 'ArrowUp' | 'Home' | 'End'
): string | null {
  const enabled = options.filter(option => !option.disabled);
  const index = enabled.findIndex(option => option.value === activeValue);
  if (key === 'Home') return enabled[0]?.value ?? null;
  if (key === 'End') return enabled.at(-1)?.value ?? null;
  if (index < 0) return (key === 'ArrowUp' ? enabled.at(-1) : enabled[0])?.value ?? null;
  const next = Math.max(0, Math.min(enabled.length - 1, index + (key === 'ArrowDown' ? 1 : -1)));
  return enabled[next]?.value ?? null;
}

export function getListboxSelection(
  selectedValues: readonly string[],
  value: string,
  selectionMode: ListboxSelectionMode
): readonly string[] {
  if (selectionMode === 'single') return [value];
  return selectedValues.includes(value)
    ? selectedValues.filter(selected => selected !== value)
    : [...selectedValues, value];
}

export function findListboxMatch(
  options: readonly ListboxOption[],
  activeValue: string | null,
  query: string,
  locale?: string
): string | null {
  const collator = new Intl.Collator(locale, { usage: 'search', sensitivity: 'base' });
  const characters = [...query.normalize('NFC')];
  if (characters.length === 0) return activeValue;
  const first = characters[0];
  const repeated = characters.every(character => collator.compare(character, first ?? '') === 0);
  const prefix = repeated ? (first ?? '') : characters.join('');
  const index = options.findIndex(option => option.value === activeValue);
  const start = repeated ? index + 1 : Math.max(0, index);
  for (let offset = 0; offset < options.length; offset++) {
    const option = options[(start + offset) % options.length];
    if (
      option &&
      !option.disabled &&
      collator.compare(
        option.label.trimStart().normalize('NFC').slice(0, prefix.length),
        prefix
      ) === 0
    ) {
      return option.value;
    }
  }
  return activeValue;
}
