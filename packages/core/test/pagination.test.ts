import { describe, expect, it } from 'vitest';
import {
  effectivePaginationPage,
  getPaginationView,
  paginationItems,
  validatePaginationNumber,
} from '../src/index.js';

describe('pagination headless helpers', () => {
  it('rejects invalid numbers without coercion', () => {
    for (const value of [
      undefined,
      '2',
      null,
      NaN,
      Infinity,
      -1,
      1.5,
      Number.MAX_SAFE_INTEGER + 1,
    ]) {
      expect(() => validatePaginationNumber(value, 'totalPages', 0)).toThrow();
    }
    expect(() => validatePaginationNumber(0, 'page', 1)).toThrow();
  });

  it('validates required names and templates and formats explicit numbering systems', () => {
    const props = { label: 'Results', totalPages: 12 };
    expect(() => getPaginationView({ ...props, label: '' }, 5)).toThrow(TypeError);
    expect(() => getPaginationView({ ...props, pageLabel: 'Page' }, 5)).toThrow(TypeError);
    expect(() => getPaginationView({ ...props, summaryLabel: '{page}' }, 5)).toThrow(TypeError);
    const view = getPaginationView({ ...props, locale: 'ar-EG-u-nu-arab' }, 5);
    expect(view.pageName(5)).toBe('Page ٥');
    expect(view.summary).toBe('Page ٥ of ١٢');
  });

  it('clamps pages and retains the zero-page anchor', () => {
    expect(effectivePaginationPage(8, 3)).toBe(3);
    expect(effectivePaginationPage(8, 0)).toBe(1);
    expect(effectivePaginationPage(8, 10)).toBe(8);
  });

  it('fills edge ranges to retain seven positions, including ellipses', () => {
    expect(paginationItems(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(paginationItems(1, 10)).toEqual([1, 2, 3, 4, 5, 'ellipsis', 10]);
    expect(paginationItems(10, 10)).toEqual([1, 'ellipsis', 6, 7, 8, 9, 10]);
    expect(paginationItems(5, 10)).toEqual([1, 'ellipsis', 4, 5, 6, 'ellipsis', 10]);
    expect(paginationItems(1, 1)).toEqual([]);
    expect(paginationItems(1, 0)).toEqual([]);
  });

  it('keeps the slot count unchanged through every page and transition', () => {
    for (const total of [2, 6, 7, 8, 20, 100]) {
      for (let page = 1; page <= total; page++) {
        const items = paginationItems(page, total);
        expect(items).toHaveLength(Math.min(7, total));
        expect(items).toContain(page);
        const numbers = items.filter(item => typeof item === 'number');
        expect(numbers[0]).toBe(1);
        expect(numbers.at(-1)).toBe(total);
        expect(numbers).toEqual([...new Set(numbers)].sort((a, b) => a - b));
      }
    }
  });

  it('uses bounded work at the maximum safe integer', () => {
    const max = Number.MAX_SAFE_INTEGER;
    expect(paginationItems(max, max)).toEqual([
      1,
      'ellipsis',
      max - 4,
      max - 3,
      max - 2,
      max - 1,
      max,
    ]);
    expect(paginationItems(100, max)).toEqual([1, 'ellipsis', 99, 100, 101, 'ellipsis', max]);
  });
});
