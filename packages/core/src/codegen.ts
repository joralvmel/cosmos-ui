import type { ComponentContract, Platform, PropSpec } from './contract.js';
import type { ListboxItem } from './specs/listbox.js';

/** Small, dependency-free collections shared by generated examples and documentation controls. */
export const listboxItemExamples: Readonly<Record<string, readonly ListboxItem<never>[]>> = {
  flat: [
    { value: 'apple', label: 'Apple' },
    { value: 'apricot', label: 'Apricot' },
    { value: 'banana', label: 'Banana', disabled: true },
    { value: 'cherry', label: 'Cherry', description: 'Seasonal' },
  ],
  grouped: [
    {
      label: 'Fruit',
      options: [
        { value: 'apple', label: 'Apple' },
        { value: 'cherry', label: 'Cherry', description: 'Seasonal' },
      ],
    },
    {
      label: 'Vegetables',
      options: [
        { value: 'carrot', label: 'Carrot' },
        { value: 'broccoli', label: 'Broccoli', disabled: true },
      ],
    },
  ],
};

export const listboxValueExamples: Readonly<Record<string, readonly string[]>> = {
  empty: [],
  apple: ['apple'],
  cherry: ['cherry'],
  'apple-cherry': ['apple', 'cherry'],
};

/** Code tabs of the Playground. */
export const snippetTargets = ['html', 'react', 'angular', 'native'] as const;
export type SnippetTarget = (typeof snippetTargets)[number];

export type ControlValue = string | number | boolean | undefined;
export type ControlValues = Record<string, ControlValue>;

const platformOf: Record<SnippetTarget, Platform> = {
  html: 'web',
  react: 'react',
  angular: 'angular',
  native: 'native',
};

export const pascalCase = (name: string) =>
  name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

/** `fullWidth` → `full-width` (attribute names of the Web Components). */
export const toAttribute = (name: string) => name.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`);

const escapeAttribute = (value: string) =>
  value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
const escapeText = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;');
const jsxText = (value: string) => (/[{}<>]/.test(value) ? `{${JSON.stringify(value)}}` : value);
const jsxString = (value: string) =>
  value.includes('"') || value.includes('\\') ? `{${JSON.stringify(value)}}` : `"${value}"`;
const contentFor = (contract: ComponentContract, content: string) =>
  Object.hasOwn(contract.slots, '') ? content : '';
const referenceSlug = (value: string) => {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
    throw new Error(`Invalid named reference "${value}" in generated snippet.`);
  }
  return value;
};
const reservedBindings = new Set(['delete', 'import', 'package']);
const referenceBinding = (value: string) => {
  const binding = referenceSlug(value).replace(/-([a-z0-9])/g, (_, character: string) =>
    character.toUpperCase()
  );
  return reservedBindings.has(binding) ? `${binding}Icon` : binding;
};

export interface ActiveProp {
  name: string;
  spec: PropSpec;
  value: string | number | boolean;
}

function referenceImports(props: ActiveProp[], indent = '', typescript = true) {
  return [
    ...new Set(
      props
        .filter(({ spec }) => spec.type === 'reference')
        .map(({ spec, value }) => {
          const slug = referenceSlug(String(value));
          if (
            spec.type === 'reference' &&
            (spec.reference === 'ListboxItems' || spec.reference === 'ListboxValues')
          ) {
            const samples =
              spec.reference === 'ListboxItems' ? listboxItemExamples : listboxValueExamples;
            const sample = samples[slug];
            if (!sample) throw new Error(`Unknown ${spec.reference} example "${slug}".`);
            return `${indent}const ${referenceBinding(slug)} = ${JSON.stringify(sample)}${typescript ? ' as const' : ''};`;
          }
          return `${indent}import { ${referenceBinding(slug)} } from '@joralvmel/cosmos-icons/${slug}';`;
        })
    ),
  ];
}

/** Props that differ from their contract default and exist on the platform. */
export function activeProps(
  contract: ComponentContract,
  values: ControlValues,
  platform: Platform
): ActiveProp[] {
  const result: ActiveProp[] = [];
  for (const [name, spec] of Object.entries(contract.props)) {
    if (spec.platforms && !spec.platforms.includes(platform)) continue;
    const value = values[name];
    if (
      value === undefined ||
      ('default' in spec &&
        value === spec.default &&
        !contract.states.some(state => state.prop === name))
    )
      continue;
    result.push({ name, spec, value });
  }
  return result;
}

function html(contract: ComponentContract, values: ControlValues, content: string) {
  content = contentFor(contract, content);
  const props = activeProps(contract, values, 'web');
  const attributes = props
    .filter(
      ({ spec, value }) =>
        spec.type !== 'reference' && !(spec.type === 'boolean' && value === false)
    )
    .map(({ name, value }) =>
      value === true
        ? toAttribute(name)
        : `${toAttribute(name)}="${escapeAttribute(String(value))}"`
    );
  const properties = props.filter(
    ({ spec, value }) => spec.type === 'reference' || (spec.type === 'boolean' && value === false)
  );
  const trigger = Object.hasOwn(contract.slots, 'trigger')
    ? contract.name === 'popover'
      ? '<cosm-icon-button slot="trigger" label="Details" variant="ghost" tone="neutral"><cosm-icon></cosm-icon></cosm-icon-button>'
      : '<button slot="trigger" type="button">Details</button>'
    : '';
  const lines = [
    `<${[contract.tag, ...attributes].join(' ')}>${trigger}${escapeText(content)}</${contract.tag}>`,
    '',
    '<script type="module">',
    `  import '@joralvmel/cosmos-elements/${contract.name}';`,
    ...(contract.name === 'popover'
      ? [
          "  import { info } from '@joralvmel/cosmos-icons/info';",
          '  document.querySelector(\'cosm-popover [slot="trigger"] cosm-icon\').icon = info;',
        ]
      : []),
    ...referenceImports(properties, '  ', false),
  ];
  const events = Object.values(contract.events);
  if (events.length > 0 || properties.length > 0) {
    lines.push('', `  const element = document.querySelector('${contract.tag}');`);
    for (const { name, spec, value } of properties) {
      lines.push(
        `  element.${name} = ${spec.type === 'reference' ? referenceBinding(String(value)) : 'false'};`
      );
    }
    for (const event of events) {
      lines.push(
        `  element.addEventListener('${event.names.dom}', event => console.log(event.detail));`
      );
    }
  }
  lines.push('</script>');
  return lines.join('\n');
}

function jsxAttributes(props: ActiveProp[]) {
  return props.map(({ name, spec, value }) =>
    spec.type === 'reference'
      ? `${name}={${referenceBinding(String(value))}}`
      : spec.type === 'boolean' && value === false
        ? `${name}={false}`
        : value === true
          ? name
          : typeof value === 'number'
            ? `${name}={${value}}`
            : `${name}=${jsxString(String(value))}`
  );
}

function jsxElement(
  component: string,
  attributes: string[],
  content: string,
  trigger = '',
  nativeText = false
) {
  const child = content && nativeText ? `<Text>${jsxText(content)}</Text>` : jsxText(content);
  const open = `<${[component, ...attributes].join(' ')}>`;
  const inline = `    ${open}${trigger}${child}</${component}>`;
  if (inline.length <= 80) return [inline];
  return [
    `    <${component}`,
    ...attributes.map(item => `      ${item}`),
    '    >',
    ...(trigger ? [`      ${trigger}`] : []),
    ...(content ? [`      ${child}`] : []),
    `    </${component}>`,
  ];
}

function example(importLine: string, element: string[], body: string[] = []) {
  return [
    importLine,
    '',
    'export function Example() {',
    ...body,
    '  return (',
    ...element,
    '  );',
    '}',
  ].join('\n');
}

function react(contract: ComponentContract, values: ControlValues, content: string) {
  content = contentFor(contract, content);
  const component = pascalCase(contract.name);
  const props = activeProps(contract, values, 'react');
  const attributes = [
    ...jsxAttributes(props),
    ...Object.values(contract.events).map(
      event => `${event.names.react}={event => console.log(event.detail)}`
    ),
  ];
  return example(
    [
      `import { ${component}${contract.name === 'popover' ? ', IconButton, Icon' : ''} } from '@joralvmel/cosmos-react';`,
      ...(contract.name === 'popover'
        ? ["import { info } from '@joralvmel/cosmos-icons/info';"]
        : []),
      ...referenceImports(props),
    ].join('\n'),
    jsxElement(
      component,
      attributes,
      content,
      Object.hasOwn(contract.slots, 'trigger')
        ? contract.name === 'popover'
          ? '<IconButton slot="trigger" label="Details" variant="ghost" tone="neutral"><Icon icon={info} /></IconButton>'
          : '<button slot="trigger" type="button">Details</button>'
        : ''
    )
  );
}

function angular(contract: ComponentContract, values: ControlValues, content: string) {
  content = contentFor(contract, content);
  const component = `Cosm${pascalCase(contract.name)}Component`;
  const props = activeProps(contract, values, 'angular');
  const attributes = props.map(({ name, spec, value }) =>
    spec.type === 'reference'
      ? `[${name}]="${referenceBinding(String(value))}"`
      : spec.type === 'boolean' && contract.states.some(state => state.prop === name)
        ? `[${name}]="${value}"`
        : spec.type === 'boolean' && value === false
          ? `[${name}]="false"`
          : value === true
            ? name
            : typeof value === 'number'
              ? `[${name}]="${value}"`
              : `${name}="${escapeAttribute(String(value))}"`
  );
  const events = Object.values(contract.events);
  const handler = (output: string) => `on${pascalCase(output)}`;
  const outputs = events.map(
    event => `(${event.names.angular})="${handler(event.names.angular)}($event.detail)"`
  );
  const trigger = Object.hasOwn(contract.slots, 'trigger')
    ? contract.name === 'popover'
      ? '<cosm-icon-button slot="trigger" label="Details" variant="ghost" tone="neutral"><cosm-icon [icon]="info" /></cosm-icon-button>'
      : '<button slot="trigger" type="button">Details</button>'
    : '';
  const template = `<${[contract.tag, ...attributes, ...outputs].join(' ')}>${trigger}${escapeText(content)}</${contract.tag}>`;
  const detailTypes = [...new Set(events.map(event => event.detail))];
  const referenceFields = [
    ...new Set(
      props
        .filter(({ spec }) => spec.type === 'reference')
        .map(({ value }) => {
          const binding = referenceBinding(String(value));
          return `  readonly ${binding} = ${binding};`;
        })
    ),
  ];
  const body = events.flatMap((event, index) => [
    ...(index > 0 ? [''] : []),
    `  ${handler(event.names.angular)}(detail: ${event.detail}) {`,
    '    console.log(detail);',
    '  }',
  ]);
  const classMembers = [
    ...(contract.name === 'popover' ? ['  readonly info = info;'] : []),
    ...referenceFields,
    ...body,
  ];
  const components = `${component}${contract.name === 'popover' ? ', CosmIconButtonComponent, CosmIconComponent' : ''}`;
  return [
    "import { Component } from '@angular/core';",
    `import { ${components} } from '@joralvmel/cosmos-angular';`,
    ...(contract.name === 'popover'
      ? ["import { info } from '@joralvmel/cosmos-icons/info';"]
      : []),
    ...referenceImports(props),
    ...(detailTypes.length > 0
      ? [`import type { ${detailTypes.join(', ')} } from '@joralvmel/cosmos-core';`]
      : []),
    '',
    '@Component({',
    "  selector: 'app-example',",
    `  imports: [${components}],`,
    `  template: \`${template.replaceAll('`', '\\`')}\`,`,
    '})',
    classMembers.length > 0
      ? `export class ExampleComponent {\n${classMembers.join('\n')}\n}`
      : 'export class ExampleComponent {}',
  ].join('\n');
}

/** `var(--cosm-primary)` → `primary`: CSS color tokens have no meaning in React Native. */
const colorToken = (value: string | number | boolean) =>
  typeof value === 'string'
    ? /^var\(--cosm-([a-z0-9]+(?:-[a-z0-9]+)*)\)$/.exec(value.trim())?.[1]
    : undefined;
const themeColor = (token: string) =>
  /^[a-z][a-z0-9]*$/.test(token) ? `theme.colors.${token}` : `theme.colors['${token}']`;

/** Paint props whose Cosmos color tokens become `useTheme()` colors; other strings stay literal. */
const themedPaintProps: Readonly<Record<string, readonly string[]>> = { icon: ['stroke', 'fill'] };

function native(contract: ComponentContract, values: ControlValues, content: string) {
  content = contentFor(contract, content);
  const component = pascalCase(contract.name);
  const props = activeProps(contract, values, 'native');
  const isPopover = contract.name === 'popover';
  let themed = false;
  const attributes = [
    ...(isPopover
      ? [
          'trigger={props => <IconButton {...props} label="Details" variant="ghost" tone="neutral"><Icon icon={info} /></IconButton>}',
        ]
      : []),
    ...props.map(prop => {
      const token = themedPaintProps[contract.name]?.includes(prop.name)
        ? colorToken(prop.value)
        : undefined;
      if (!token) return jsxAttributes([prop])[0] as string;
      themed = true;
      return `${prop.name}={${themeColor(token)}}`;
    }),
    ...Object.values(contract.events).map(
      event => `${event.names.native}={detail => console.log(detail)}`
    ),
  ];
  const imports = [
    component,
    ...(isPopover ? ['PopoverProvider', 'IconButton', 'Icon'] : []),
    ...(themed ? ['useTheme'] : []),
  ].join(', ');
  const element = jsxElement(component, attributes, content, '', isPopover);
  return example(
    [
      `import { ${imports} } from '@joralvmel/cosmos-native';`,
      ...(isPopover ? ["import { info } from '@joralvmel/cosmos-icons/info';"] : []),
      ...(isPopover && content ? ["import { Text } from 'react-native';"] : []),
      ...referenceImports(props),
    ].join('\n'),
    isPopover
      ? ['    <PopoverProvider>', ...element.map(line => `  ${line}`), '    </PopoverProvider>']
      : element,
    themed ? ['  const theme = useTheme();'] : []
  );
}

/** Whether a code tab applies to the component (no Web Component tabs for native-only ones). */
export function supportsTarget(contract: ComponentContract, target: SnippetTarget): boolean {
  return !contract.platforms || contract.platforms.includes(platformOf[target]);
}

/** Snippets for every platform of the component, built from the contract and control values. */
export function generateSnippets(
  contract: ComponentContract,
  values: ControlValues,
  content: string
): Partial<Record<SnippetTarget, string>> {
  const builders = { html, react, angular, native };
  const sampleValues = { ...values };
  for (const [name, spec] of Object.entries(contract.props)) {
    if (spec.type === 'string' && spec.required && sampleValues[name] === undefined) {
      sampleValues[name] = pascalCase(contract.name);
    }
    if (spec.type === 'reference' && !Object.hasOwn(values, name) && spec.example) {
      sampleValues[name] = spec.example;
    }
  }
  const result: Partial<Record<SnippetTarget, string>> = {};
  for (const target of snippetTargets) {
    if (supportsTarget(contract, target)) {
      result[target] = builders[target](contract, sampleValues, content);
    }
  }
  return result;
}

export interface SnippetChild {
  contract: ComponentContract;
  values: ControlValues;
}

/** Compose a default-slot child into each platform's generated example. */
export function generateComposedSnippets(
  contract: ComponentContract,
  values: ControlValues,
  content: string,
  child?: SnippetChild
): Partial<Record<SnippetTarget, string>> {
  if (!child) return generateSnippets(contract, values, content);
  const marker = 'COSMOS_PLAYGROUND_CHILD';
  const parents = generateSnippets(contract, values, marker);
  const children = generateSnippets(child.contract, child.values, '');
  const component = pascalCase(child.contract.name);
  for (const platform of snippetTargets) {
    let parent = parents[platform];
    const source = children[platform];
    if (!parent || !source) continue;
    const tag = platform === 'html' || platform === 'angular' ? child.contract.tag : component;
    const start = source.indexOf(`<${tag}`);
    const end = source.indexOf(`</${tag}>`, start) + tag.length + 3;
    if (start < 0 || end < tag.length + 3) throw new Error('Missing generated child markup.');
    parent = parent.replace(marker, source.slice(start, end));
    const wrapperImport =
      /import \{ ([^}]+) \} from '(@joralvmel\/cosmos-(?:react|native|angular))';/;
    const childNames = wrapperImport.exec(source)?.[1];
    if (childNames) {
      parent = parent.replace(wrapperImport, (_, names: string, module: string) => {
        const merged = [...new Set([...names.split(', '), ...childNames.split(', ')])];
        return `import { ${merged.join(', ')} } from '${module}';`;
      });
    }
    const imports = source
      .split('\n')
      .filter(line => /^\s*import /.test(line) && !wrapperImport.test(line))
      .filter(line => !parent?.includes(line));
    if (platform === 'html') {
      parent = parent.replace(
        '<script type="module">',
        `<script type="module">\n${imports.join('\n')}`
      );
      if (source.includes('\n  const element =')) {
        const setup = source.slice(
          source.indexOf('\n  const element ='),
          source.indexOf('</script>')
        );
        parent = parent.replace(
          '</script>',
          `${setup.replaceAll('element', 'childElement')}</script>`
        );
      }
    } else {
      parent = [...imports, parent].join('\n');
      if (platform === 'angular') {
        parent = parent.replace(
          /imports: \[([^\]]+)\]/,
          (_, names: string) => `imports: [${names}, Cosm${component}Component]`
        );
        const fields = source.split('\n').filter(line => /^\s+readonly /.test(line));
        parent = parent.replace(
          'export class ExampleComponent {',
          `export class ExampleComponent {\n${fields.join('\n')}`
        );
      }
    }
    parents[platform] = parent;
  }
  return parents;
}
