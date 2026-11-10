import { describe, expect, it } from 'vitest';
import {
  buttonContract,
  componentReference,
  contractMarkdown,
  eventsMarkdown,
  propsMarkdown,
  snippetsMarkdown,
} from '../src/index.js';

describe('contract markdown', () => {
  it('renders the props of a platform', () => {
    const web = propsMarkdown(buttonContract, 'web');
    expect(web).toContain("| `variant` | 'solid' \\| 'soft' \\| 'outline' \\| 'ghost' | `solid` |");
    expect(web).toContain('| `fullWidth` (`full-width`) | boolean | `false` |');
    expect(propsMarkdown(buttonContract, 'native')).not.toContain('`type`');
  });

  it('renders event names on every platform', () => {
    expect(eventsMarkdown(buttonContract)).toContain(
      '| `cosm-press` | `onPress` | `(press)` | `onPress` | `ButtonPressDetail` |'
    );
  });

  it('renders the full API and snippets', () => {
    const api = contractMarkdown(buttonContract);
    expect(api).toContain('**Slots**');
    expect(api).toContain('| `(default)` | Button label. |');
    expect(api).toContain('**Keyboard**');
    const snippets = snippetsMarkdown(buttonContract, 'Save');
    expect(snippets).toContain('**React Native**');
    expect(snippets).toContain('```tsx\nimport { Button } from');
  });

  it('describes a component for one platform', () => {
    const angular = componentReference(buttonContract, 'angular');
    expect(angular).toContain('### `CosmButtonComponent` (`<cosm-button>`)');
    expect(angular).toContain('`(press)` → `ButtonPressDetail`');
    expect(componentReference(buttonContract, 'web')).toContain(
      '```html\n<cosm-button>Button</cosm-button>'
    );
  });
});
