export type Messages = Readonly<Record<string, string>>;
export type Values = Readonly<Record<string, string | number | Date>>;

export interface Translator {
  readonly locale: string;
  /** Formats a message: `{name}` arguments, numbers and dates formatted with `Intl`. */
  t(key: string, values?: Values): string;
  number(value: number, options?: Intl.NumberFormatOptions): string;
  date(value: Date | number, options?: Intl.DateTimeFormatOptions): string;
  list(values: readonly string[], options?: Intl.ListFormatOptions): string;
}

/**
 * Creates a translator for one locale. Missing keys fall back to `fallback` messages and then
 * to the key itself, so the UI never shows `undefined`.
 */
export function createTranslator(
  locale: string,
  messages: Messages,
  fallback: Messages = {}
): Translator {
  const numberFormat = (options?: Intl.NumberFormatOptions) =>
    new Intl.NumberFormat(locale, options);
  const format = (value: string | number | Date) =>
    typeof value === 'number'
      ? numberFormat().format(value)
      : value instanceof Date
        ? new Intl.DateTimeFormat(locale).format(value)
        : value;

  return {
    locale,
    t(key, values = {}) {
      const template = messages[key] ?? fallback[key] ?? key;
      return template.replace(/\{(\w+)\}/g, (match, name: string) =>
        Object.hasOwn(values, name) ? format(values[name] as string | number | Date) : match
      );
    },
    number: (value, options) => numberFormat(options).format(value),
    date: (value, options) => new Intl.DateTimeFormat(locale, options).format(value),
    list: (values, options) => new Intl.ListFormat(locale, options).format(values),
  };
}
