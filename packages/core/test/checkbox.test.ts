import { describe, expect, it } from 'vitest';
import { validateSize } from '../src/headless/size.js';

describe('shared component size validation', () => {
  it('accepts semantic sizes and positive finite custom sizes', () => {
    for (const size of ['sm', 'md', 'lg', 16, 20.5]) {
      expect(() => validateSize(size, 'Checkbox')).not.toThrow();
    }
  });

  it('rejects invalid custom sizes and semantic values explicitly', () => {
    for (const size of [0, -1, Number.NaN, Number.POSITIVE_INFINITY, 'huge']) {
      expect(() => validateSize(size, 'Checkbox')).toThrow(/Checkbox size/);
    }
  });
});
