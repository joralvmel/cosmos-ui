export const SELECT_NONE_VALUE = '__cosm-none__';

export function normalizeSelectValue(value: string | null): string | null {
  return value === SELECT_NONE_VALUE ? null : value;
}
