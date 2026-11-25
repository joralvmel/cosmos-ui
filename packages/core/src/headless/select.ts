import type { ListboxOption } from '../specs/listbox.js';
import type { SelectValue } from '../specs/select.js';

export function validateSelectValue(
  value: SelectValue,
  options: readonly ListboxOption[],
  property: 'value' | 'defaultValue'
): void {
  if (
    value !== null &&
    (typeof value !== 'string' || !value.trim() || !options.some(option => option.value === value))
  ) {
    throw new TypeError(`Select ${property} must be null or match an option value.`);
  }
}
