import type { RadioGroupOption, RadioGroupValue } from '../specs/radio-group.js';

/** Validates the flat option collection shared by the Web and Native implementations. */
export function validateRadioGroupOptions(options: readonly RadioGroupOption[]): void {
  if (!Array.isArray(options)) throw new TypeError('RadioGroup options must be an array.');

  const values = new Set<string>();
  for (const [index, option] of options.entries()) {
    if (!option || typeof option !== 'object') {
      throw new TypeError(`RadioGroup option at index ${index} must be an object.`);
    }
    if (typeof option.value !== 'string' || !option.value.trim()) {
      throw new TypeError(`RadioGroup option at index ${index} must have a non-empty value.`);
    }
    if (values.has(option.value)) {
      throw new TypeError(
        `RadioGroup option values must be unique; "${option.value}" is repeated.`
      );
    }
    if (typeof option.label !== 'string' || !option.label.trim()) {
      throw new TypeError(`RadioGroup option "${option.value}" must have a non-empty label.`);
    }
    if (option.description !== undefined && typeof option.description !== 'string') {
      throw new TypeError(`RadioGroup option "${option.value}" description must be a string.`);
    }
    if (option.disabled !== undefined && typeof option.disabled !== 'boolean') {
      throw new TypeError(`RadioGroup option "${option.value}" disabled must be a boolean.`);
    }
    values.add(option.value);
  }
}

/** Returns the selected enabled option, or the first enabled option for initial focus. */
export function getRadioGroupInitialActive(
  options: readonly RadioGroupOption[],
  value: RadioGroupValue | undefined
): string | null {
  if (value !== null && value !== undefined) {
    const selected = options.find(option => option.value === value && !option.disabled);
    if (selected) return selected.value;
  }
  return options.find(option => !option.disabled)?.value ?? null;
}

/** Moves to the next enabled option and wraps at either end of the collection. */
export function moveRadioGroupActive(
  options: readonly RadioGroupOption[],
  currentValue: string,
  direction: -1 | 1
): string | null {
  if (options.length === 0) return null;
  const currentIndex = options.findIndex(option => option.value === currentValue);
  const startIndex = currentIndex >= 0 ? currentIndex : direction === 1 ? -1 : 0;
  for (let step = 1; step <= options.length; step++) {
    const index = (startIndex + direction * step + options.length * step) % options.length;
    const option = options[index];
    if (option && !option.disabled) return option.value;
  }
  return null;
}

/** Rejects selected or default values that do not identify an option. */
export function validateRadioGroupValue(
  value: RadioGroupValue | undefined,
  options: readonly RadioGroupOption[],
  propName: 'value' | 'defaultValue'
): void {
  if (value === undefined || value === null) return;
  if (typeof value !== 'string' || !options.some(option => option.value === value)) {
    throw new TypeError(`RadioGroup ${propName} must be null or match an option value.`);
  }
}
