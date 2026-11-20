import { describe, expect, it } from 'vitest';
import {
  activeProps,
  badgeContract,
  buttonContract,
  type ComponentContract,
  defineContract,
  generateSnippets,
  iconButtonContract,
  listboxContract,
  popoverContract,
  radioGroupContract,
  selectContract,
  supportsTarget,
  switchContract,
  textFieldContract,
  toAttribute,
} from '../src/index.js';

const defaults = Object.fromEntries(
  Object.entries(buttonContract.props as ComponentContract['props']).map(([name, spec]) => [
    name,
    'default' in spec ? spec.default : undefined,
  ])
);

describe('codegen', () => {
  it('declares listbox collections and selection arrays on every platform', () => {
    const snippets = generateSnippets(
      listboxContract,
      { selectionMode: 'multiple', selectedValues: 'apple-cherry', size: 57 },
      ''
    );
    for (const source of Object.values(snippets)) {
      expect(source).toContain('const grouped =');
      expect(source).toContain('"options":[');
      expect(source).toContain('const appleCherry = ["apple","cherry"]');
      expect(source).not.toContain('cosmos-icons/grouped');
      expect(source).not.toContain('cosmos-icons/apple-cherry');
    }
    expect(snippets.html).toContain('element.items = grouped;');
    expect(snippets.html).toContain('element.selectedValues = appleCherry;');
    expect(snippets.html).not.toContain('as const');
    expect(snippets.react).toContain('selectedValues={appleCherry}');
    expect(snippets.angular).toContain('[items]="grouped"');
    expect(snippets.native).toContain('size={57}');
  });

  it('generates typed Radio Group options and nullable values on every platform', () => {
    const snippets = generateSnippets(
      radioGroupContract,
      {
        label: 'Contact method',
        options: 'contact-methods',
        value: 'none',
        orientation: 'horizontal',
      },
      ''
    );
    expect(snippets.html).toContain('const contactMethods = [{"value":"email"');
    expect(snippets.html).toContain('const none = null;');
    expect(snippets.html).toContain('element.options = contactMethods;');
    expect(snippets.html).toContain('element.value = none;');
    expect(snippets.react).toContain('options={contactMethods}');
    expect(snippets.react).toContain('value={none}');
    expect(snippets.angular).toContain('[options]="contactMethods"');
    expect(snippets.angular).toContain('[value]="none"');
    expect(snippets.native).toContain('options={contactMethods}');
    expect(snippets.native).toContain('value={none}');
    for (const source of Object.values(snippets)) {
      expect(source).not.toContain('cosmos-icons/contact-methods');
      expect(source).not.toContain('cosmos-icons/none');
    }
  });

  it('generates Select item collections and nullable values on every platform', () => {
    const snippets = generateSnippets(
      selectContract,
      {
        label: 'Fruit',
        items: 'grouped',
        value: 'none',
        placeholder: 'Choose a fruit',
      },
      ''
    );
    expect(snippets.html).toContain('const grouped =');
    expect(snippets.html).toContain('const none = null;');
    expect(snippets.html).toContain('element.items = grouped;');
    expect(snippets.html).toContain('element.value = none;');
    expect(snippets.react).toContain('items={grouped}');
    expect(snippets.react).toContain('value={none}');
    expect(snippets.angular).toContain('[items]="grouped"');
    expect(snippets.angular).toContain('[value]="none"');
    expect(snippets.native).toContain('items={grouped}');
    expect(snippets.native).toContain('value={none}');
    for (const source of Object.values(snippets)) {
      expect(source).not.toContain('cosmos-icons/grouped');
      expect(source).not.toContain('cosmos-icons/none');
    }
  });
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

  it('generates Switch snippets with required labels and web-only form and size props', () => {
    const snippets = generateSnippets(
      switchContract,
      {
        label: 'Enable notifications',
        size: 28,
        checked: false,
        name: 'notifications',
        value: 'yes',
      },
      'ignored child content'
    );
    expect(snippets.html).toContain(
      '<cosm-switch label="Enable notifications" size="28" name="notifications" value="yes"></cosm-switch>'
    );
    expect(snippets.html).toContain('element.checked = false;');
    expect(snippets.react).toContain('label="Enable notifications"');
    expect(snippets.react).toContain('checked={false}');
    expect(snippets.react).toContain('size={28}');
    expect(snippets.angular).toContain('[checked]="false"');
    expect(snippets.angular).toContain('[size]="28"');
    expect(snippets.native).toContain('label="Enable notifications"');
    expect(snippets.native).toContain('checked={false}');
    expect(snippets.native).not.toMatch(/\b(?:size|name|value)=/);
    for (const source of Object.values(snippets)) {
      expect(source).not.toContain('ignored child content');
    }
    expect(snippets.html).toContain("addEventListener('cosm-checked-change'");
    expect(snippets.react).toContain('onCheckedChange={event => console.log(event.detail)}');
    expect(snippets.angular).toContain('(checkedChange)="onCheckedChange($event.detail)"');
    expect(snippets.native).toContain('onCheckedChange={detail => console.log(detail)}');
  });

  it('only emits props available on each platform', () => {
    const snippets = generateSnippets(buttonContract, { ...defaults, type: 'submit' }, 'Go');
    expect(snippets.react).toContain('type="submit"');
    expect(snippets.native).not.toContain('type=');
  });

  it('preserves explicit controlled toggle values, including the default false', () => {
    for (const pressed of [false, true]) {
      const snippets = generateSnippets(iconButtonContract, { label: 'Favorite', pressed }, '');
      expect(snippets.angular).toContain(`[pressed]="${pressed}"`);
      expect(snippets.react).toContain(pressed ? ' pressed' : 'pressed={false}');
      expect(snippets.native).toContain(pressed ? ' pressed' : 'pressed={false}');
      if (pressed) expect(snippets.html).toContain(' pressed');
      else expect(snippets.html).toContain('element.pressed = false;');
    }
    const autonomous = generateSnippets(iconButtonContract, { label: 'Favorite' }, '');
    for (const source of Object.values(autonomous)) {
      expect(source).not.toMatch(/(?:\s|\.)pressed(?:[= >])/);
    }
  });

  it('includes an accessible trigger in named-trigger web examples', () => {
    const snippets = generateSnippets(popoverContract, { open: false }, 'More information');
    for (const source of [snippets.html, snippets.react, snippets.angular]) {
      expect(source).toContain('slot="trigger" label="Details"');
      expect(source).toContain('@joralvmel/cosmos-icons/info');
      expect(source).toContain('More information');
    }
    expect(snippets.html).toContain('element.open = false;');
    expect(snippets.react).toContain('open={false}');
    expect(snippets.angular).toContain('[open]="false"');
    expect(snippets.native).toContain('import { Popover, PopoverProvider, IconButton, Icon }');
    expect(snippets.native).toContain("import { Text } from 'react-native';");
    expect(snippets.native).toContain('trigger={props => <IconButton {...props}');
    expect(snippets.native).toContain('<Text>More information</Text>');
    expect(snippets.native).toContain('<PopoverProvider>');
  });

  it('generates the optional popover interactions and zero distance across adapters', () => {
    const snippets = generateSnippets(
      popoverContract,
      { closable: true, arrow: true, gap: 0, triggerMode: 'hover', closeLabel: 'Dismiss' },
      'Details'
    );
    expect(snippets.html).toContain('gap="0"');
    expect(snippets.react).toContain('gap={0}');
    expect(snippets.angular).toContain('[gap]="0"');
    expect(snippets.native).toContain('gap={0}');
    for (const source of Object.values(snippets)) {
      expect(source).toContain('closable');
      expect(source).toContain('arrow');
      expect(source).toContain('Dismiss');
    }
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
      slots: { '': 'Sheet content.' },
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

  it('generates usable text-field examples without duplicate icon bindings or blank children', () => {
    const snippets = generateSnippets(textFieldContract, {}, '');
    for (const snippet of Object.values(snippets)) {
      expect(snippet).toContain('label="TextField"');
      expect(snippet.match(/import \{ search \} from/g)).toHaveLength(1);
      expect(snippet).not.toMatch(/^[ \t]+$/m);
    }
    expect(snippets.angular?.match(/readonly search = search;/g)).toHaveLength(1);
    expect(generateSnippets(textFieldContract, { label: 'Account name' }, '').react).toContain(
      'label="Account name"'
    );
    const undecorated = generateSnippets(
      textFieldContract,
      { startIcon: undefined, endIcon: undefined },
      ''
    );
    for (const snippet of Object.values(undecorated)) {
      expect(snippet).not.toContain('cosmos-icons/');
      expect(snippet).not.toContain('startIcon');
      expect(snippet).not.toContain('endIcon');
    }
  });

  it('generates Badge default-slot text and optional icon references for every platform', () => {
    const plain = generateSnippets(
      badgeContract,
      { variant: 'outline', tone: 'warning', startIcon: undefined },
      '0'
    );
    expect(plain.html).toContain('<cosm-badge variant="outline" tone="warning">0</cosm-badge>');
    expect(plain.react).toContain('<Badge variant="outline" tone="warning">0</Badge>');
    expect(plain.angular).toContain('<cosm-badge variant="outline" tone="warning">0</cosm-badge>');
    expect(plain.native).toContain('<Badge variant="outline" tone="warning">0</Badge>');
    for (const source of Object.values(plain)) {
      expect(source).not.toContain('cosmos-icons/');
      expect(source).not.toContain('startIcon');
      expect(source).toContain('>0</');
    }

    const withIcon = generateSnippets(badgeContract, { startIcon: 'heart' }, 'Ready');
    expect(withIcon.html).toContain("import { heart } from '@joralvmel/cosmos-icons/heart';");
    expect(withIcon.html).toContain('element.startIcon = heart;');
    expect(withIcon.react).toContain('startIcon={heart}');
    expect(withIcon.angular).toContain('[startIcon]="heart"');
    expect(withIcon.native).toContain('startIcon={heart}');
    expect(withIcon.native).not.toContain('<Text>Ready</Text>');
    for (const source of Object.values(withIcon)) {
      expect(source).toContain('>Ready</');
      expect(source).toContain('@joralvmel/cosmos-icons/heart');
    }
  });
});
