// Templates for `npm run generate -- component <name>`. Every TODO(generator) marker must be resolved
// before the work is considered done (see .github/skills/create-component/SKILL.md).

export const contract = (n, platforms) => `import { defineContract } from '../contract.js';

/**
 * ${n.title}: TODO(generator) describe the component and link its WAI-ARIA pattern.
 */
export const ${n.camel}Contract = defineContract({
  name: '${n.kebab}',
  tag: '${n.tag}',
  description: 'TODO(generator): one-line description.',${platforms ? `\n  platforms: [${platforms.map(p => `'${p}'`).join(', ')}],` : ''}
  role: 'TODO(generator)',
  pattern: 'https://www.w3.org/WAI/ARIA/apg/patterns/',
  props: {
    disabled: {
      type: 'boolean',
      default: false,
      reflect: true,
      description: 'Prevents interaction.',
    },
  },
  events: {},
  states: [],
  slots: { '': 'Content.' },
  parts: { base: 'Root element.' },
  cssProperties: {},
  keyboard: [],
});
`;

export const scenarios = n => `import type { Platform } from '../contract.js';

export interface ${n.pascal}Scenario {
  name: string;
  props: { disabled?: boolean };
  expected: { disabled: boolean };
  platforms?: readonly Platform[];
}

/** Shared behavior scenarios, run by the web and native tests. TODO(generator) add real behavior. */
export const ${n.camel}Scenarios: readonly ${n.pascal}Scenario[] = [
  { name: 'is enabled by default', props: {}, expected: { disabled: false } },
  { name: 'can be disabled', props: { disabled: true }, expected: { disabled: true } },
];

export const ${n.camel}ScenariosFor = (platform: Platform) =>
  ${n.camel}Scenarios.filter(scenario => !scenario.platforms || scenario.platforms.includes(platform));
`;

export const coreExports = n => `export { ${n.camel}Contract } from './specs/${n.kebab}.js';
export {
  type ${n.pascal}Scenario,
  ${n.camel}Scenarios,
  ${n.camel}ScenariosFor,
} from './specs/${n.kebab}.scenarios.js';
`;

export const element =
  n => `import { type ContractProps, ${n.camel}Contract } from '@joralvmel/cosmos-core';
import { css, html } from 'lit';
import { CosmElement } from '../../internal/cosm-element.js';
import { define } from '../../internal/define.js';
import { boxSizing } from '../../internal/styles.js';

type Props = Required<ContractProps<typeof ${n.camel}Contract, 'web'>>;

/**
 * TODO(generator): describe the component.
 *
 * @tag ${n.tag}
 * @slot - Content.
 * @csspart base - Root element.
 */
export class Cosm${n.pascal} extends CosmElement {
  static override properties = {
    disabled: { type: Boolean, reflect: true },
  };

  declare disabled: Props['disabled'];

  constructor() {
    super();
    this.disabled = ${n.camel}Contract.props.disabled.default;
  }

  protected override render() {
    return html\`<div part="base" class="base" aria-disabled=\${this.disabled ? 'true' : 'false'}>
      <slot></slot>
    </div>\`;
  }

  static override styles = [
    boxSizing,
    css\`
      :host {
        display: inline-block;
        color: var(--cosm-fg, oklch(0.24 0.01 268));
        font-family: var(--cosm-font-sans, system-ui, sans-serif);
      }
      :host([disabled]) {
        opacity: 0.5;
      }
    \`,
  ];
}

define('${n.tag}', Cosm${n.pascal});

declare global {
  interface HTMLElementTagNameMap {
    '${n.tag}': Cosm${n.pascal};
  }
}
`;

export const elementTest =
  n => `import { ${n.camel}Contract, ${n.camel}ScenariosFor, propNames } from '@joralvmel/cosmos-core';
import { afterEach, describe, expect, it } from 'vitest';
import { Cosm${n.pascal} } from '../src/components/${n.kebab}/${n.tag}.js';
import { cleanup, fixture } from './fixture.js';

afterEach(cleanup);

describe('${n.tag}: shared scenarios', () => {
  for (const scenario of ${n.camel}ScenariosFor('web')) {
    it(scenario.name, async () => {
      const el = await fixture<Cosm${n.pascal}>('<${n.tag}>Content</${n.tag}>');
      Object.assign(el, scenario.props);
      await el.updateComplete;
      const base = el.shadowRoot?.querySelector('[part="base"]');
      expect(base?.getAttribute('aria-disabled')).toBe(String(scenario.expected.disabled));
    });
  }
});

describe('${n.tag}: contract drift', () => {
  it('exposes exactly the web props of the contract', () => {
    expect(Object.keys(Cosm${n.pascal}.properties).sort()).toEqual(
      propNames(${n.camel}Contract, 'web').sort()
    );
  });
});
`;

export const elementExports = n =>
  `export { Cosm${n.pascal} } from './components/${n.kebab}/${n.tag}.js';\n`;

export const react = n => `import { Cosm${n.pascal} } from '@joralvmel/cosmos-elements/${n.kebab}';
import { createComponent } from '@lit/react';
import * as React from 'react';

/** React event props of \`${n.pascal}\`, mapped to DOM events. TODO(generator) add contract events. */
export const ${n.camel}Events = {};

/** React wrapper of \`<${n.tag}>\`. */
export const ${n.pascal} = createComponent({
  tagName: '${n.tag}',
  elementClass: Cosm${n.pascal},
  react: React,
  events: ${n.camel}Events,
  displayName: '${n.pascal}',
});

export type ${n.pascal}Props = React.ComponentProps<typeof ${n.pascal}>;
`;

export const reactExports = n =>
  `export { ${n.pascal}, type ${n.pascal}Props, ${n.camel}Events } from './components/${n.kebab}.js';\n`;

export const reactTest =
  n => `import { eventNames, ${n.camel}Contract } from '@joralvmel/cosmos-core';
import { describe, expect, it } from 'vitest';
import { ${n.camel}Events } from '../src/index.js';

describe('${n.pascal}: contract drift', () => {
  it('maps every contract event to its React name', () => {
    expect(Object.keys(${n.camel}Events)).toEqual(eventNames(${n.camel}Contract, 'react'));
  });
});
`;

export const angular = n => `import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  inject,
} from '@angular/core';
import type { Cosm${n.pascal} } from '@joralvmel/cosmos-elements/${n.kebab}';
import '@joralvmel/cosmos-elements/${n.kebab}';

/** Angular proxy of \`<${n.tag}>\`. TODO(generator) add contract inputs and outputs. */
@Component({
  selector: '${n.tag}',
  template: '<ng-content />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Cosm${n.pascal}Component {
  readonly element: Cosm${n.pascal} = inject<ElementRef<Cosm${n.pascal}>>(ElementRef).nativeElement;

  @Input({ transform: booleanAttribute }) set disabled(value: boolean) {
    this.element.disabled = value;
  }
}
`;

export const angularTest =
  n => `import { eventNames, ${n.camel}Contract, propNames } from '@joralvmel/cosmos-core';
import { describe, expect, it } from 'vitest';
import { COSMOS_COMPONENTS, Cosm${n.pascal}Component } from '../src/index.js';

describe('Cosm${n.pascal}Component: contract drift', () => {
  it('declares exactly the contract inputs and outputs', () => {
    const def = (Cosm${n.pascal}Component as unknown as { ɵcmp: { inputs: object; outputs: object } })
      .ɵcmp;
    expect(Object.keys(def.inputs).sort()).toEqual(propNames(${n.camel}Contract, 'angular').sort());
    expect(Object.keys(def.outputs)).toEqual(eventNames(${n.camel}Contract, 'angular'));
  });

  it('is part of COSMOS_COMPONENTS', () => {
    expect(COSMOS_COMPONENTS).toContain(Cosm${n.pascal}Component);
  });
});
`;

export const native =
  n => `import { type ContractProps, ${n.camel}Contract } from '@joralvmel/cosmos-core';
import type { ReactNode } from 'react';
import { type StyleProp, Text, View, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/theme-provider.js';

type Contract${n.pascal}Props = ContractProps<typeof ${n.camel}Contract, 'native'>;

export interface ${n.pascal}Props extends Contract${n.pascal}Props {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Props handled by the native component; checked against the contract by the drift test. */
export const ${n.camel}PropNames = ['disabled'] as const satisfies readonly (keyof Contract${n.pascal}Props)[];

/** Native ${n.title}. TODO(generator) implement the contract behavior. */
export function ${n.pascal}({
  disabled = ${n.camel}Contract.props.disabled.default,
  children,
  style,
  testID,
}: ${n.pascal}Props) {
  const theme = useTheme();
  return (
    <View
      testID={testID}
      accessibilityState={{ disabled }}
      style={[{ opacity: disabled ? 0.5 : 1 }, style]}
    >
      {typeof children === 'string' ? (
        <Text style={{ color: theme.colors.fg, fontSize: theme.text.md }}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}
`;

export const nativeExports = n =>
  `export { ${n.pascal}, type ${n.pascal}Props, ${n.camel}PropNames } from './components/${n.kebab}.js';\n`;

export const nativeTest =
  n => `import { ${n.camel}Contract, propNames } from '@joralvmel/cosmos-core';
import { describe, expect, it } from 'vitest';
import { ${n.camel}PropNames } from '../src/index.js';

describe('${n.pascal} (native): contract drift', () => {
  it('handles exactly the native props of the contract', () => {
    expect([...${n.camel}PropNames].sort()).toEqual(propNames(${n.camel}Contract, 'native').sort());
  });
});
`;

export const nativeScreen = n => `import { ${n.pascal}, useTheme } from '@joralvmel/cosmos-native';
import { Stack } from 'expo-router';
import { ScrollView, Text } from 'react-native';

export default function ${n.pascal}Screen() {
  const theme = useTheme();
  const label = { color: theme.colors.fg, fontSize: theme.text.md };
  return (
    <ScrollView contentContainerStyle={{ padding: theme.space.lg, gap: theme.space.lg }}>
      <Stack.Screen options={{ title: '${n.title}' }} />
      <${n.pascal}>
        <Text style={label}>${n.title}</Text>
      </${n.pascal}>
      <${n.pascal} disabled>
        <Text style={label}>Disabled</Text>
      </${n.pascal}>
    </ScrollView>
  );
}
`;

export const nativeScreenEntry = n =>
  `  { route: '/${n.kebab}', title: '${n.title}', description: 'TODO(generator): short description.' },\n`;

const docsBody = (n, locale) => {
  const es = locale === 'es';
  const up = es ? '../../../../components' : '../../../components';
  return `---
title: ${n.title}
description: ${es ? 'TODO(generator) descripción breve.' : 'TODO(generator) short description.'}
---

import ApiTable from '${up}/ApiTable.astro';
import Playground from '${up}/Playground.astro';
import Preview from '${up}/Preview.astro';

${es ? 'TODO(generator): cuándo usar' : 'TODO(generator): when to use'} \`<${n.tag}>\`.

## Playground

<Playground name="${n.kebab}" content="${n.title}" />

## ${es ? 'Ejemplos' : 'Examples'}

<Preview>
  <${n.tag}>${n.title}</${n.tag}>
</Preview>

## ${es ? 'Accesibilidad' : 'Accessibility'}

- TODO(generator)

## API

<ApiTable name="${n.kebab}" />
`;
};

export const docsEn = n => docsBody(n, 'en');
export const docsEs = n => docsBody(n, 'es');

export const changeset = n => `---
'@joralvmel/cosmos-core': minor
'@joralvmel/cosmos-elements': minor
'@joralvmel/cosmos-react': minor
'@joralvmel/cosmos-angular': minor
'@joralvmel/cosmos-native': minor
---

Add the ${n.title} component (\`<${n.tag}>\`) with its contract, React, Angular and React Native implementations.
`;

export const nativeOnlyChangeset = n => `---
'@joralvmel/cosmos-core': minor
'@joralvmel/cosmos-native': minor
---

Add the native-only ${n.title} component with its contract.
`;
