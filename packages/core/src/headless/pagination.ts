import type { ContractProps } from '../contract.js';
import { paginationContract } from '../specs/pagination.js';

/** A visible page number or a noninteractive omitted range. */
export type PaginationItem = number | 'ellipsis';

export function validatePaginationNumber(
  value: unknown,
  name: string,
  minimum: number
): asserts value is number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < minimum) {
    throw new RangeError(`${name} must be a safe integer greater than or equal to ${minimum}.`);
  }
}

/** Zero pages retain the autonomous anchor of one. */
export function effectivePaginationPage(page: number, totalPages: number): number {
  validatePaginationNumber(totalPages, 'totalPages', 0);
  validatePaginationNumber(page, 'page', 1);
  return Math.min(page, Math.max(1, totalPages));
}

/** Constant-size range, including for the maximum safe integer page count. */
export function paginationItems(page: number, totalPages: number): PaginationItem[] {
  const current = effectivePaginationPage(page, totalPages);
  if (totalPages <= 1) return [];
  const candidates = [1, current - 1, current, current + 1, totalPages].filter(
    value => value >= 1 && value <= totalPages && Number.isSafeInteger(value)
  );
  const sorted = [...new Set(candidates)].sort((a, b) => a - b);
  const result: PaginationItem[] = [];
  for (const value of sorted) {
    const previous = result[result.length - 1];
    if (typeof previous === 'number') {
      const gap = value - previous;
      if (gap === 2) result.push(previous + 1);
      else if (gap > 2) result.push('ellipsis');
    }
    result.push(value);
  }
  return result;
}

/** Shared validation and localization; state ownership stays with each renderer. */
export function getPaginationView(
  input: ContractProps<typeof paginationContract, 'web'>,
  requestedPage: number
) {
  const specs = paginationContract.props;
  const settings = {
    ...input,
    defaultPage: input.defaultPage === undefined ? specs.defaultPage.default : input.defaultPage,
    previousLabel:
      input.previousLabel === undefined ? specs.previousLabel.default : input.previousLabel,
    nextLabel: input.nextLabel === undefined ? specs.nextLabel.default : input.nextLabel,
    firstLabel: input.firstLabel === undefined ? specs.firstLabel.default : input.firstLabel,
    lastLabel: input.lastLabel === undefined ? specs.lastLabel.default : input.lastLabel,
    pageLabel: input.pageLabel === undefined ? specs.pageLabel.default : input.pageLabel,
    summaryLabel:
      input.summaryLabel === undefined ? specs.summaryLabel.default : input.summaryLabel,
    direction: input.direction === undefined ? specs.direction.default : input.direction,
    presentation:
      input.presentation === undefined ? specs.presentation.default : input.presentation,
    variant: input.variant === undefined ? specs.variant.default : input.variant,
    size: input.size === undefined ? specs.size.default : input.size,
  };
  validatePaginationNumber(settings.defaultPage, 'defaultPage', 1);
  if (input.page !== undefined) validatePaginationNumber(input.page, 'page', 1);
  const page = effectivePaginationPage(requestedPage, settings.totalPages);
  for (const key of [
    'label',
    'previousLabel',
    'nextLabel',
    'firstLabel',
    'lastLabel',
    'pageLabel',
    'summaryLabel',
  ] as const) {
    if (typeof settings[key] !== 'string' || !settings[key].trim()) {
      throw new TypeError(`Pagination ${key} must be a non-empty string.`);
    }
  }
  if (!settings.pageLabel.includes('{page}')) {
    throw new TypeError('Pagination pageLabel must contain {page}.');
  }
  if (!settings.summaryLabel.includes('{page}') || !settings.summaryLabel.includes('{total}')) {
    throw new TypeError('Pagination summaryLabel must contain {page} and {total}.');
  }
  for (const key of ['direction', 'presentation', 'variant', 'size'] as const) {
    const values: readonly string[] = specs[key].values;
    if (!values.includes(settings[key])) throw new TypeError(`Invalid Pagination ${key}.`);
  }
  const numbers = new Intl.NumberFormat(input.locale, { useGrouping: false });
  const format = (template: string, value: number) =>
    template
      .replaceAll('{page}', numbers.format(value))
      .replaceAll('{total}', numbers.format(settings.totalPages));
  return {
    ...settings,
    page,
    items: paginationItems(page, settings.totalPages),
    number: (value: number) => numbers.format(value),
    pageName: (value: number) => format(settings.pageLabel, value),
    summary: format(settings.summaryLabel, page),
  };
}
