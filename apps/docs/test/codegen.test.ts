import { buttonContract, type ComponentContract, defineContract } from '@joralvmel/cosmos-core';
import { describe, expect, it } from 'vitest';
import { activeProps, generateSnippets, supportsTarget, toAttribute } from '../src/lib/codegen';

const defaults = Object.fromEntries(
  Object.entries(buttonContract.props as ComponentContract['props']).map(([name, spec]) => [
    name,
    spec.default,
  ])
);

describe('codegen', () => {
  it('omits props that keep their default value', () => {
    expect(activeProps(buttonContract, defaults, 'web')).toEqual([]);
    const snippets = generateSnippets(buttonContract, defaults, 'Save');
    expect(snippets.html?.split('\n')[0]).toBe('<cosm-button>Save</cosm-button>');
    expect(snippets.react).toContain(
      '<Button onPress={event => console.log(event.detail)}>Save</Button>'
    );
  });

  it('maps props and events to every platform (ADR 0003)', () => {
    const values = { ...defaults, variant: 'soft', fullWidth: true, type: 'submit' };
    const snippets = generateSnippets(buttonContract, values, 'Save');
    expect(snippets.html).toContain(
      '<cosm-button variant="soft" full-width type="submit">Save</cosm-button>'
    );
    expect(snippets.html).toContain(
      "element.addEventListener('cosm-press', event => console.log(event.detail));"
    );
    expect(snippets.html).toContain("import '@joralvmel/cosmos-elements/button';");
    expect(snippets.react).toContain("import { Button } from '@joralvmel/cosmos-react';");
    expect(snippets.react).toMatch(/variant="soft"\s+fullWidth\s+type="submit"/);
    expect(snippets.angular).toContain(
      "import { CosmButtonComponent } from '@joralvmel/cosmos-angular';"
    );
    expect(snippets.angular).toContain(
      '<cosm-button variant="soft" fullWidth type="submit" (press)="onPress($event.detail)">Save</cosm-button>'
    );
    expect(snippets.angular).toContain('onPress(detail: ButtonPressDetail) {');
    expect(snippets.native).toContain("import { Button } from '@joralvmel/cosmos-native';");
    expect(snippets.native).toContain('onPress={detail => console.log(detail)}');
  });

  it('only emits props available on each platform', () => {
    const snippets = generateSnippets(buttonContract, { ...defaults, type: 'submit' }, 'Go');
    expect(snippets.react).toContain('type="submit"');
    expect(snippets.native).not.toContain('type=');
  });

  it('escapes user text in HTML and JSX', () => {
    const values = { ...defaults, label: 'Say "hi" <now>' };
    const snippets = generateSnippets(buttonContract, values, '<b>{x}</b>');
    expect(snippets.html).toContain('label="Say &quot;hi&quot; &lt;now>"');
    expect(snippets.html).toContain('>&lt;b>{x}&lt;/b></cosm-button>');
    expect(snippets.react).toContain('label={"Say \\"hi\\" <now>"}');
    expect(snippets.react).toContain('{"<b>{x}</b>"}');
  });

  it('skips web tabs for native-only components and handles components without events', () => {
    const sheet: ComponentContract = defineContract({
      name: 'bottom-sheet',
      tag: 'cosm-bottom-sheet',
      description: 'Sheet.',
      platforms: ['native'],
      role: 'dialog',
      pattern: 'https://example.com',
      props: { open: { type: 'boolean', default: false, description: 'Open.' } },
      events: {},
      states: [],
      slots: {},
      parts: {},
      cssProperties: {},
      keyboard: [],
    });
    expect(supportsTarget(sheet, 'html')).toBe(false);
    const snippets = generateSnippets(sheet, { open: true }, 'Content');
    expect(Object.keys(snippets)).toEqual(['native']);
    expect(snippets.native).toContain('<BottomSheet open>Content</BottomSheet>');
  });

  it('converts prop names to attributes', () => {
    expect(toAttribute('fullWidth')).toBe('full-width');
  });
});
