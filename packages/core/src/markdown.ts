import {
  activeProps,
  generateSnippets,
  pascalCase,
  type SnippetTarget,
  toAttribute,
} from './codegen.js';
import type { ComponentContract, Platform, PropSpec } from './contract.js';

const cell = (value: string) => value.replaceAll('|', '\\|').replaceAll('\n', ' ');

export const propType = (spec: PropSpec) =>
  spec.type === 'enum' ? spec.values.map(value => `'${value}'`).join(' \\| ') : spec.type;

const snippetLanguage: Record<SnippetTarget, string> = {
  html: 'html',
  react: 'tsx',
  angular: 'ts',
  native: 'tsx',
};

export const snippetTitles: Record<SnippetTarget, string> = {
  html: 'HTML / Web Component',
  react: 'React',
  angular: 'Angular',
  native: 'React Native',
};

/** Properties table of a contract, optionally limited to the props of one platform. */
export function propsMarkdown(contract: ComponentContract, platform?: Platform): string {
  const rows = Object.entries(contract.props)
    .filter(([, spec]) => !platform || !spec.platforms || spec.platforms.includes(platform))
    .map(([name, spec]) => {
      const attribute =
        platform === 'web' && toAttribute(name) !== name ? ` (\`${toAttribute(name)}\`)` : '';
      const value = spec.default === undefined ? '—' : `\`${String(spec.default)}\``;
      return `| \`${name}\`${attribute} | ${propType(spec)} | ${value} | ${cell(spec.description)} |`;
    });
  return ['| Prop | Type | Default | Description |', '| --- | --- | --- | --- |', ...rows].join(
    '\n'
  );
}

/** Event names on every platform (ADR 0003). */
export function eventsMarkdown(contract: ComponentContract): string {
  const events = Object.values(contract.events);
  if (events.length === 0) return 'No events.';
  return [
    '| DOM | React | Angular | React Native | Detail | Description |',
    '| --- | --- | --- | --- | --- | --- |',
    ...events.map(
      event =>
        `| \`${event.names.dom}\` | \`${event.names.react}\` | \`(${event.names.angular})\` | \`${event.names.native}\` | \`${event.detail}\` | ${cell(event.description)}${event.cancelable ? ' (cancelable)' : ''} |`
    ),
  ].join('\n');
}

function listTable(title: string, entries: Record<string, string>, empty = '(default)') {
  const rows = Object.entries(entries);
  if (rows.length === 0) return '';
  return [
    `**${title}**`,
    '',
    '| Name | Description |',
    '| --- | --- |',
    ...rows.map(([name, text]) => `| \`${name || empty}\` | ${cell(text)} |`),
  ].join('\n');
}

/** Full API of a contract: props, events (optional), slots, parts, CSS properties and keyboard. */
export function contractMarkdown(
  contract: ComponentContract,
  options: { events?: boolean } = {}
): string {
  const keyboard =
    contract.keyboard.length === 0
      ? ''
      : [
          '**Keyboard**',
          '',
          '| Keys | Action |',
          '| --- | --- |',
          ...contract.keyboard.map(
            entry => `| ${entry.keys.map(key => `\`${key}\``).join(', ')} | ${cell(entry.action)} |`
          ),
        ].join('\n');
  return [
    propsMarkdown(contract),
    options.events === false ? '' : `**Events**\n\n${eventsMarkdown(contract)}`,
    listTable('Slots', contract.slots),
    listTable('CSS parts', contract.parts),
    listTable('CSS custom properties', contract.cssProperties),
    keyboard,
  ]
    .filter(Boolean)
    .join('\n\n');
}

/** Usage snippets (default values) as fenced code blocks, one per platform of the component. */
export function snippetsMarkdown(
  contract: ComponentContract,
  content = pascalCase(contract.name),
  values: Record<string, string | number | boolean | undefined> = {}
): string {
  const snippets = generateSnippets(contract, values, content);
  return (Object.entries(snippets) as [SnippetTarget, string][])
    .map(
      ([target, code]) =>
        `**${snippetTitles[target]}**\n\n\`\`\`${snippetLanguage[target]}\n${code}\n\`\`\``
    )
    .join('\n\n');
}

/** Compact description of one component for one platform (used by the llms.md references). */
export function componentReference(contract: ComponentContract, platform: Platform): string {
  const name = pascalCase(contract.name);
  const heading =
    platform === 'web'
      ? `\`<${contract.tag}>\``
      : platform === 'angular'
        ? `\`Cosm${name}Component\` (\`<${contract.tag}>\`)`
        : `\`${name}\``;
  const events = Object.values(contract.events).map(event => {
    const names = {
      web: event.names.dom,
      react: event.names.react,
      angular: `(${event.names.angular})`,
      native: event.names.native,
    };
    return `\`${names[platform]}\` → \`${event.detail}\``;
  });
  const target: SnippetTarget = platform === 'web' ? 'html' : platform;
  const example = generateSnippets(
    contract,
    Object.fromEntries(activeProps(contract, {}, platform).map(prop => [prop.name, prop.value])),
    pascalCase(contract.name)
  )[target];
  return [
    `### ${heading}`,
    '',
    contract.description,
    '',
    propsMarkdown(contract, platform),
    '',
    `Events: ${events.length > 0 ? events.join(', ') : 'none'}.`,
    '',
    `\`\`\`${snippetLanguage[target]}\n${example ?? ''}\n\`\`\``,
  ].join('\n');
}
