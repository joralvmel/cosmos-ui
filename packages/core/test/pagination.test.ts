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

  it('fills one-page gaps and omits longer gaps', () => {
    expect(paginationItems(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(paginationItems(5, 10)).toEqual([1, 'ellipsis', 4, 5, 6, 'ellipsis', 10]);
    expect(paginationItems(1, 1)).toEqual([]);
    expect(paginationItems(1, 0)).toEqual([]);
  });

  it('uses bounded work at the maximum safe integer', () => {
    const max = Number.MAX_SAFE_INTEGER;
    expect(paginationItems(max, max)).toEqual([1, 'ellipsis', max - 1, max]);
    expect(paginationItems(100, max)).toEqual([1, 'ellipsis', 99, 100, 101, 'ellipsis', max]);
  });
});
