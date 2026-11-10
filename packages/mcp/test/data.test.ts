import { describe, expect, it } from 'vitest';
import { getComponent, listComponents, listThemes } from '../src/index.js';

describe('MCP data layer', () => {
  it('lists components from the contracts', () => {
    expect(listComponents()).toContainEqual(
      expect.objectContaining({ name: 'button', tag: 'cosm-button' })
    );
  });

  it('returns a contract by name and ignores prototype keys', () => {
    expect(getComponent('button')?.events.press?.names.react).toBe('onPress');
    expect(getComponent('constructor')).toBeUndefined();
  });

  it('lists themes, starting with the default one', () => {
    const names = listThemes().map(theme => theme.name);
    expect(names[0]).toBe('cosmos');
    expect(names).toContain('nebula');
  });
});
