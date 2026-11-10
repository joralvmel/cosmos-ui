import { describe, expect, it } from 'vitest';
import { createTranslator } from '../src/index.js';

describe('createTranslator', () => {
  const es = createTranslator(
    'es',
    { greeting: 'Hola, {name}', items: '{count} elementos' },
    { bye: 'Goodbye' }
  );

  it('interpolates and formats values for the locale', () => {
    expect(es.t('greeting', { name: 'Ada' })).toBe('Hola, Ada');
    expect(es.t('items', { count: 1234.5 })).toBe('1234,5 elementos');
  });

  it('falls back to default messages and keys', () => {
    expect(es.t('bye')).toBe('Goodbye');
    expect(es.t('missing.key')).toBe('missing.key');
    expect(es.t('greeting')).toBe('Hola, {name}');
  });

  it('exposes Intl helpers', () => {
    expect(es.list(['a', 'b', 'c'])).toBe('a, b y c');
    expect(es.number(0.5, { style: 'percent' })).toMatch(/50\s?%/);
  });
});
