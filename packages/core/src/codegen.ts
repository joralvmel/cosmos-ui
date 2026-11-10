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
    if (value === undefined || value === '' || value === spec.default) continue;
    if (spec.type === 'boolean' && value === false) continue;
    result.push({ name, spec, value });
  }
  return result;
}

function html(contract: ComponentContract, values: ControlValues, content: string) {
  const attributes = activeProps(contract, values, 'web').map(({ name, value }) =>
    value === true ? toAttribute(name) : `${toAttribute(name)}="${escapeAttribute(String(value))}"`
  );
  const lines = [
    `<${[contract.tag, ...attributes].join(' ')}>${escapeText(content)}</${contract.tag}>`,
    '',
    '<script type="module">',
    `  import '@joralvmel/cosmos-elements/${contract.name}';`,
  ];
  const events = Object.values(contract.events);
  if (events.length > 0) {
    lines.push('', `  const element = document.querySelector('${contract.tag}');`);
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
  return props.map(({ name, value }) =>
    value === true
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

function example(importLine: string, element: string[]) {
  return [
    importLine,
    '',
    'export function Example() {',
    '  return (',
    ...element,
    '  );',
    '}',
  ].join('\n');
}

function react(contract: ComponentContract, values: ControlValues, content: string) {
  const component = pascalCase(contract.name);
  const attributes = [
    ...jsxAttributes(activeProps(contract, values, 'react')),
    ...Object.values(contract.events).map(
      event => `${event.names.react}={event => console.log(event.detail)}`
    ),
  ];
  return example(
    `import { ${component} } from '@joralvmel/cosmos-react';`,
    jsxElement(component, attributes, content)
  );
}

function angular(contract: ComponentContract, values: ControlValues, content: string) {
  const component = `Cosm${pascalCase(contract.name)}Component`;
  const attributes = activeProps(contract, values, 'angular').map(({ name, value }) =>
    value === true
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
  const body = events.flatMap((event, index) => [
    ...(index > 0 ? [''] : []),
    `  ${handler(event.names.angular)}(detail: ${event.detail}) {`,
    '    console.log(detail);',
    '  }',
  ]);
  return [
    "import { Component } from '@angular/core';",
    `import { ${component} } from '@joralvmel/cosmos-angular';`,
    ...(detailTypes.length > 0
      ? [`import type { ${detailTypes.join(', ')} } from '@joralvmel/cosmos-core';`]
      : []),
    '',
    '@Component({',
    "  selector: 'app-example',",
    `  imports: [${component}],`,
    `  template: \`${template.replaceAll('`', '\\`')}\`,`,
    '})',
    body.length > 0
      ? `export class ExampleComponent {\n${body.join('\n')}\n}`
      : 'export class ExampleComponent {}',
  ].join('\n');
}

function native(contract: ComponentContract, values: ControlValues, content: string) {
  const component = pascalCase(contract.name);
  const attributes = [
    ...jsxAttributes(activeProps(contract, values, 'native')),
    ...Object.values(contract.events).map(
      event => `${event.names.native}={detail => console.log(detail)}`
    ),
  ];
  return example(
    `import { ${component} } from '@joralvmel/cosmos-native';`,
    jsxElement(component, attributes, content)
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
  const result: Partial<Record<SnippetTarget, string>> = {};
  for (const target of snippetTargets) {
    if (supportsTarget(contract, target)) {
      result[target] = builders[target](contract, values, content);
    }
  }
  return result;
}
