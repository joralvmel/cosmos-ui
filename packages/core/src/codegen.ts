import type { ComponentContract, Platform, PropSpec } from './contract.js';

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
    if (value === undefined || ('default' in spec && value === spec.default)) continue;
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
  const lines = [
    `<${[contract.tag, ...attributes].join(' ')}>${escapeText(content)}</${contract.tag}>`,
    '',
    '<script type="module">',
    `  import '@joralvmel/cosmos-elements/${contract.name}';`,
    ...properties
      .filter(({ spec }) => spec.type === 'reference')
      .map(({ value }) => {
        const slug = referenceSlug(String(value));
        const binding = referenceBinding(slug);
        return `  import { ${binding} } from '@joralvmel/cosmos-icons/${slug}';`;
      }),
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

function jsxElement(component: string, attributes: string[], content: string) {
  const open = `<${[component, ...attributes].join(' ')}>`;
  const inline = `    ${open}${jsxText(content)}</${component}>`;
  if (inline.length <= 80) return [inline];
  return [
    `    <${component}`,
    ...attributes.map(item => `      ${item}`),
    '    >',
    `      ${jsxText(content)}`,
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
  const referenceImports = props
    .filter(({ spec }) => spec.type === 'reference')
    .map(({ value }) => {
      const slug = referenceSlug(String(value));
      const binding = referenceBinding(slug);
      return `import { ${binding} } from '@joralvmel/cosmos-icons/${slug}';`;
    });
  return example(
    [`import { ${component} } from '@joralvmel/cosmos-react';`, ...referenceImports].join('\n'),
    jsxElement(component, attributes, content)
  );
}

function angular(contract: ComponentContract, values: ControlValues, content: string) {
  content = contentFor(contract, content);
  const component = `Cosm${pascalCase(contract.name)}Component`;
  const props = activeProps(contract, values, 'angular');
  const attributes = props.map(({ name, spec, value }) =>
    spec.type === 'reference'
      ? `[${name}]="${referenceBinding(String(value))}"`
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
  const template = `<${[contract.tag, ...attributes, ...outputs].join(' ')}>${escapeText(content)}</${contract.tag}>`;
  const detailTypes = [...new Set(events.map(event => event.detail))];
  const referenceImports = props
    .filter(({ spec }) => spec.type === 'reference')
    .map(({ value }) => {
      const slug = referenceSlug(String(value));
      const binding = referenceBinding(slug);
      return `import { ${binding} } from '@joralvmel/cosmos-icons/${slug}';`;
    });
  const referenceFields = props
    .filter(({ spec }) => spec.type === 'reference')
    .map(({ value }) => {
      const binding = referenceBinding(String(value));
      return `  readonly ${binding} = ${binding};`;
    });
  const body = events.flatMap((event, index) => [
    ...(index > 0 ? [''] : []),
    `  ${handler(event.names.angular)}(detail: ${event.detail}) {`,
    '    console.log(detail);',
    '  }',
  ]);
  const classMembers = [...referenceFields, ...body];
  return [
    "import { Component } from '@angular/core';",
    `import { ${component} } from '@joralvmel/cosmos-angular';`,
    ...referenceImports,
    ...(detailTypes.length > 0
      ? [`import type { ${detailTypes.join(', ')} } from '@joralvmel/cosmos-core';`]
      : []),
    '',
    '@Component({',
    "  selector: 'app-example',",
    `  imports: [${component}],`,
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
  let themed = false;
  const attributes = [
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
  const referenceImports = props
    .filter(({ spec }) => spec.type === 'reference')
    .map(({ value }) => {
      const slug = referenceSlug(String(value));
      const binding = referenceBinding(slug);
      return `import { ${binding} } from '@joralvmel/cosmos-icons/${slug}';`;
    });
  const imports = themed ? `${component}, useTheme` : component;
  return example(
    [`import { ${imports} } from '@joralvmel/cosmos-native';`, ...referenceImports].join('\n'),
    jsxElement(component, attributes, content),
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
    if (spec.type === 'reference' && sampleValues[name] === undefined && spec.example) {
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
