import { describe, expect, it } from 'vitest';
import {
  findListboxMatch,
  getListboxInitialActive,
  getListboxOptions,
  getListboxSelection,
  moveListboxActive,
  validateListboxSize,
  validateListboxValues,
} from '../src/headless/listbox.js';
import { listboxScenarioItems } from '../src/specs/listbox.scenarios.js';

describe('listbox collection and selection', () => {
  const options = getListboxOptions(listboxScenarioItems);

  it('flattens groups and navigates enabled options independently of selection', () => {
    expect(getListboxInitialActive(options, ['banana', 'cherry'])).toBe('cherry');
    expect(getListboxInitialActive(options, [])).toBe('apple');
    expect(moveListboxActive(options, 'apricot', 'ArrowDown')).toBe('cherry');
    expect(moveListboxActive(options, 'cherry', 'ArrowDown')).toBe('cherry');
    expect(moveListboxActive(options, 'apple', 'ArrowUp')).toBe('apple');
    expect(moveListboxActive(options, null, 'ArrowUp')).toBe('cherry');
    expect(moveListboxActive([], null, 'Home')).toBeNull();
    expect(getListboxInitialActive([{ value: 'a', label: 'A', disabled: true }], [])).toBeNull();
  });

  it('rejects duplicate values across groups and invalid group names', () => {
    expect(() =>
      getListboxOptions([
        { value: 'a', label: 'A' },
        { label: 'Group', options: [{ value: 'a', label: 'Another A' }] },
      ])
    ).toThrow(/unique/);
    expect(() => getListboxOptions([{ label: ' ', options }])).toThrow(/groups/);
    expect(() => getListboxOptions([{ label: 'Empty', options: [] }])).toThrow(/groups/);
    expect(() => getListboxOptions([{ value: '', label: 'A' }])).toThrow(/nonempty/);
  });

  it('retains absent selected values and toggles without mutating owner arrays', () => {
    const values = Object.freeze(['absent', 'apple']);
    expect(getListboxSelection(values, 'cherry', 'multiple')).toEqual([
      'absent',
      'apple',
      'cherry',
    ]);
    expect(getListboxSelection(values, 'apple', 'multiple')).toEqual(['absent']);
    expect(getListboxSelection(values, 'cherry', 'single')).toEqual(['cherry']);
    expect(values).toEqual(['absent', 'apple']);
  });

  it('rejects invalid selection cardinality, duplicate values and custom sizes', () => {
    expect(() => validateListboxValues(['a', 'b'], 'single')).toThrow();
    expect(() => validateListboxValues(['a', 'a'], 'multiple')).toThrow();
    expect(() => validateListboxValues([' '], 'single')).toThrow();
    for (const size of [0, -1, Number.NaN, Number.POSITIVE_INFINITY, 'huge']) {
      expect(() => validateListboxSize(size)).toThrow(/size/);
    }
    expect(() => validateListboxSize(53)).not.toThrow();
  });
});

describe('listbox typeahead', () => {
  it('matches locale-aware prefixes, extends a query and cycles repeated letters', () => {
    expect(findListboxMatch(optionsForSearch, 'apple', 'a', 'en')).toBe('apricot');
    expect(findListboxMatch(optionsForSearch, 'apricot', 'ap', 'en')).toBe('apricot');
    expect(findListboxMatch(optionsForSearch, 'apricot', 'aa', 'en')).toBe('apple');
    expect(findListboxMatch(optionsForSearch, 'apple', 'e', 'fr')).toBe('eclair');
    expect(findListboxMatch(optionsForSearch, 'apple', 'b', 'en')).toBe('apple');
    expect(findListboxMatch(optionsForSearch, 'apple', 'zzz', 'en')).toBe('apple');
    expect(() => findListboxMatch(optionsForSearch, null, 'a', 'not_a_locale')).toThrow();
  });
});

const optionsForSearch = [
  { value: 'apple', label: 'Apple' },
  { value: 'apricot', label: 'Apricot' },
  { value: 'banana', label: 'Banana', disabled: true },
  { value: 'eclair', label: 'E\u0301clair' },
];
