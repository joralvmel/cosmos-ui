// Converts docs pages (MDX) to plain Markdown for AI consumers: `.md` versions of every page,
// /llms-full.txt and the search index of the MCP server. Docs components become Markdown generated
// from the contracts, so the output never drifts from the code.
import {
  contractMarkdown,
  contracts,
  eventsMarkdown,
  isStack,
  setupMarkdown,
  snippetsMarkdown,
} from '@joralvmel/cosmos-core';
import { builtInThemes } from '@joralvmel/cosmos-tokens';
import { getStatusReport, toMarkdown } from '../status/component-status.mjs';

/** Splits `---` frontmatter (simple `key: value` lines) from the body. */
export function splitFrontmatter(source) {
  const text = source.replace(/\r\n/g, '\n');
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(text);
  if (!match) return { data: {}, body: text };
  const data = {};
  for (const line of match[1].split('\n')) {
    const index = line.indexOf(':');
    if (index > 0 && !line.startsWith(' ')) {
      data[line.slice(0, index).trim()] = line
        .slice(index + 1)
        .trim()
        .replace(/^(['"])(.*)\1$/, '$2');
    }
  }
  return { data, body: text.slice(match[0].length) };
}

const attribute = (tag, name) => new RegExp(`${name}="([^"]*)"`).exec(tag)?.[1];
const contractOf = tag => contracts[attribute(tag, 'name')];

function dedent(lines) {
  const indents = lines.filter(line => line.trim()).map(line => /^ */.exec(line)[0].length);
  const min = indents.length ? Math.min(...indents) : 0;
  return lines.map(line => line.slice(min));
}

/**
 * MDX body → Markdown. `report` is a status report (`getStatusReport()`), computed once by callers
 * that convert many pages.
 */
export function mdxToMarkdown(source, { report } = {}) {
  const { data, body } = splitFrontmatter(source);
  const status = () => report ?? getStatusReport();
  const lines = body.split('\n');
  const output = [];
  let preview;
  let tabIndent = false;

  for (const raw of lines) {
    const line = tabIndent ? raw.replace(/^ {4}/, '') : raw;
    const trimmed = line.trim();
    if (/^import .+ from '.+';$/.test(trimmed)) continue;
    if (preview) {
      if (trimmed === '</Preview>') {
        output.push('```html', ...dedent(preview), '```');
        preview = undefined;
      } else preview.push(line);
      continue;
    }
    if (trimmed === '<Preview>') {
      preview = [];
      continue;
    }
    if (/^<\/?(Steps|Tabs|CardGrid)\b[^>]*>$/.test(trimmed) || trimmed === '</Card>') continue;
    if (trimmed.startsWith('<TabItem')) {
      output.push(`**${attribute(trimmed, 'label') ?? ''}**`);
      tabIndent = true;
      continue;
    }
    if (trimmed === '</TabItem>') {
      tabIndent = false;
      continue;
    }
    if (trimmed.startsWith('<Card ')) {
      output.push(`### ${attribute(trimmed, 'title') ?? ''}`);
      continue;
    }
    if (trimmed.startsWith('<StatusBadge')) {
      const item = status().components.find(
        component => component.name === attribute(trimmed, 'name')
      );
      if (item) output.push(`Status: **${item.status}** (${item.platforms.join(', ')}).`);
      continue;
    }
    if (trimmed.startsWith('<Playground')) {
      const contract = contractOf(trimmed);
      if (contract) output.push(snippetsMarkdown(contract, attribute(trimmed, 'content') ?? ''));
      continue;
    }
    if (trimmed.startsWith('<ApiTable')) {
      const contract = contractOf(trimmed);
      if (contract) output.push(contractMarkdown(contract, { events: false }));
      continue;
    }
    if (trimmed.startsWith('<EventsTable')) {
      const contract = contractOf(trimmed);
      if (contract) output.push(eventsMarkdown(contract));
      continue;
    }
    if (trimmed.startsWith('<SetupSteps')) {
      const stack = attribute(trimmed, 'stack');
      if (stack && isStack(stack)) output.push(setupMarkdown(stack).replace(/^## .*\n\n/, ''));
      continue;
    }
    if (trimmed.startsWith('<StatusTable')) {
      output.push(toMarkdown(status()).replace(/^# .*\n\n/, ''));
      continue;
    }
    if (trimmed.startsWith('<ThemeGallery')) {
      output.push(
        ...builtInThemes.map(
          theme => `- **${theme.label}** (\`data-theme="${theme.name}"\`), light and dark.`
        )
      );
      continue;
    }
    output.push(line);
  }

  const header = [
    `# ${data.title ?? ''}`.trim(),
    data.description ? `\n> ${data.description}` : '',
  ];
  return `${[...header, '', ...output]
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()}\n`;
}
