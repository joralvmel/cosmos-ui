import {
  aiRules,
  type ComponentContract,
  catalog,
  contractMarkdown,
  contracts,
  DOCS_URL,
  generateSnippets,
  pascalCase,
  type SnippetTarget,
  type Stack,
  setupMarkdown,
  stacks,
} from '@joralvmel/cosmos-core';
import {
  builtInThemes,
  type Mode,
  resolveTheme,
  type SemanticColor,
  semanticColors,
} from '@joralvmel/cosmos-tokens';
import { loadData, type McpData } from './data.js';

export interface ComponentSummary {
  name: string;
  title: string;
  tag: string;
  category: string;
  status: string;
  platforms: string[];
  dependsOn: string[];
}

/** Every catalog component (planned ones included) with its status. */
export function listComponents(data: McpData = loadData()): ComponentSummary[] {
  return catalog.map(entry => {
    const status = data.status.components.find(item => item.name === entry.name);
    return {
      name: entry.name,
      title: entry.title,
      tag: `cosm-${entry.name}`,
      category: entry.category,
      status: status?.status ?? 'planned',
      platforms: [...entry.platforms],
      dependsOn: [...entry.dependsOn],
    };
  });
}

export interface ComponentDetails {
  name: string;
  status: string;
  pattern: string;
  contract: ComponentContract | undefined;
  api: string | undefined;
  snippets: Partial<Record<SnippetTarget, string>>;
  imports: Record<string, string>;
  docs: string;
}

/** Contract, API, snippets for every platform and status of a component (`undefined` if unknown). */
export function getComponent(
  name: string,
  data: McpData = loadData()
): ComponentDetails | undefined {
  const entry = catalog.find(item => item.name === name);
  if (!entry) return undefined;
  const contract = Object.hasOwn(contracts, name)
    ? (contracts as Record<string, ComponentContract>)[name]
    : undefined;
  const pascal = pascalCase(name);
  return {
    name,
    status: data.status.components.find(item => item.name === name)?.status ?? 'planned',
    pattern: entry.pattern,
    contract,
    api: contract ? contractMarkdown(contract) : undefined,
    snippets: contract ? generateSnippets(contract, {}, entry.title) : {},
    imports: {
      html: `import '@joralvmel/cosmos-elements/${name}';`,
      react: `import { ${pascal} } from '@joralvmel/cosmos-react';`,
      angular: `import { Cosm${pascal}Component } from '@joralvmel/cosmos-angular';`,
      native: `import { ${pascal} } from '@joralvmel/cosmos-native';`,
    },
    docs: `${DOCS_URL}components/${name}/`,
  };
}

export function listThemes() {
  return builtInThemes.map(theme => ({
    name: theme.name,
    label: theme.label,
    harmony: theme.harmony,
    radius: theme.radius,
    modes: ['light', 'dark', 'system'],
  }));
}

/** Semantic color values and radius of a theme and mode (`undefined` for unknown themes). */
export function getTokens(themeName = builtInThemes[0]?.name ?? 'cosmos', mode: Mode = 'light') {
  const definition = builtInThemes.find(theme => theme.name === themeName);
  if (!definition) return undefined;
  const resolved = resolveTheme(definition);
  const colors = Object.fromEntries(
    semanticColors.map(name => [
      `--cosm-${name}`,
      resolved.modes[mode].colors[name as SemanticColor],
    ])
  );
  return {
    theme: definition.name,
    mode,
    colors,
    radius: Object.fromEntries(
      Object.entries(resolved.radius).map(([k, v]) => [`--cosm-radius-${k}`, v])
    ),
    usage:
      'Use var(--cosm-<name>) in CSS or the Tailwind theme utilities (bg-primary, text-fg-muted…).',
  };
}

/** Install commands, setup code and AI rules for a framework. */
export function getSetup(stack: Stack) {
  return `${setupMarkdown(stack)}\n\n## Rules for AI assistants\n\n${aiRules(stack)
    .map(rule => `- ${rule}`)
    .join('\n')}\n`;
}

export interface SearchResult {
  title: string;
  url: string;
  excerpt: string;
  score: number;
}

const terms = (text: string) =>
  text
    .toLowerCase()
    .split(/[^a-z0-9-]+/)
    .filter(term => term.length > 1);

/** Keyword search over the docs pages and the AI references. */
export function searchDocs(query: string, limit = 5, data: McpData = loadData()): SearchResult[] {
  const words = terms(query);
  if (words.length === 0) return [];
  const sources = [
    ...data.docs.map(page => ({
      title: page.title,
      url: `${DOCS_URL}${page.slug ? `${page.slug}/` : ''}`,
      text: page.markdown,
    })),
    ...Object.entries(data.llms).map(([pkg, text]) => ({
      title: `@joralvmel/cosmos-${pkg} (llms.md)`,
      url: `${DOCS_URL}ai/${pkg}.md`,
      text,
    })),
  ];
  return sources
    .map(source => {
      const lower = source.text.toLowerCase();
      const title = source.title.toLowerCase();
      let score = 0;
      for (const word of words) {
        score += lower.split(word).length - 1 + (title.includes(word) ? 5 : 0);
      }
      const first = Math.max(0, lower.indexOf(words[0] ?? ''));
      const excerpt = source.text
        .slice(Math.max(0, first - 120), first + 280)
        .replace(/\s+/g, ' ')
        .trim();
      return { title: source.title, url: source.url, excerpt, score };
    })
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export { stacks };
