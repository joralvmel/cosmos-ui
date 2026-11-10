#!/usr/bin/env node
// Keeps the AI references (packages/*/llms.md) in sync with the code. Each file has a hand-written
// introduction and a generated block (install, setup per framework, components with props, events
// and examples, themes and rules for AI assistants).
//
//   npm run llms             rewrite the generated blocks
//   npm run llms -- --check  fail when a block is outdated (CI and tools/test/llms.test.mjs)
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  aiRules,
  componentReference,
  contractMarkdown,
  contracts,
  DOCS_URL,
  setupMarkdown,
  supports,
} from '@joralvmel/cosmos-core';
import { builtInThemes } from '@joralvmel/cosmos-tokens';
import { findRoot } from '../status/component-status.mjs';

export const START = '<!-- generated:start (npm run llms, do not edit this block by hand) -->';
export const END = '<!-- generated:end -->';

/** What the generated block of each package contains. */
export const profiles = {
  tokens: { install: true, themes: true, tokens: true },
  tailwind: { stacks: ['tailwind'], themes: true },
  core: { install: true, contracts: true },
  elements: { platform: 'web', stacks: ['html'], themes: true },
  react: { platform: 'react', stacks: ['react', 'next'], themes: true },
  angular: { platform: 'angular', stacks: ['angular'], themes: true },
  native: { platform: 'native', stacks: ['react-native'], themes: true },
  'charts-core': { install: true, early: true },
  charts: { install: true, early: true },
  'charts-native': { install: true, early: true },
  icons: { install: true, early: true },
  i18n: { install: true },
  mcp: { mcp: true },
  cli: { cli: true },
};

const fence = (language, code) => `\`\`\`${language}\n${code}\n\`\`\``;

function themesSection(platform) {
  const list = builtInThemes.map(theme => `\`${theme.name}\``).join(', ');
  const how =
    platform === 'native'
      ? fence(
          'tsx',
          '<CosmosThemeProvider theme="nebula" mode="system">{children}</CosmosThemeProvider>'
        )
      : fence(
          'html',
          '<html data-theme="nebula" data-mode="system">\n<!-- runtime: setTheme(name), setMode(mode) from @joralvmel/cosmos-tokens/runtime -->'
        );
  return [
    '## Themes',
    '',
    `Built-in themes: ${list} (default \`${builtInThemes[0]?.name}\`), each with \`light\` and \`dark\` modes; \`system\` follows the OS.`,
    '',
    how,
    '',
    `Custom themes: \`defineTheme()\` in \`@joralvmel/cosmos-tokens\` (${DOCS_URL}theming/themes/).`,
  ].join('\n');
}

function tokensSection() {
  return [
    '## Tokens',
    '',
    'Semantic colors (`--cosm-<name>`): bg, surface, surface-raised, fg, fg-muted, border, border-strong, primary (+ -hover, -fg, -subtle, -text), accent (same), success | warning | danger | info (+ -fg, -subtle, -text), focus-ring, overlay, chart-1..8.',
    'Scales: `--cosm-<neutral|primary|accent|success|warning|danger|info>-<1..12>`.',
    'Base: `--cosm-space-*`, `--cosm-text-*`, `--cosm-weight-*`, `--cosm-leading-*`, `--cosm-radius-*`, `--cosm-shadow-*`, `--cosm-control-*`, `--cosm-duration-*`, `--cosm-easing-*`, `--cosm-z-*`.',
    'React Native: `getNativeTheme(name, mode)` from `@joralvmel/cosmos-tokens/native` (hex colors, sizes in points).',
  ].join('\n');
}

/** Generated block for one package. */
export function generateBlock(pkg) {
  const profile = profiles[pkg];
  if (!profile) throw new Error(`No llms profile for package "${pkg}"`);
  const name = `@joralvmel/cosmos-${pkg}`;
  const sections = [];
  if (profile.install) {
    sections.push(['## Install', '', fence('bash', `npm install ${name}`)].join('\n'));
  }
  if (profile.early) {
    sections.push(
      `Status: early development; the API may change. Component status: ${DOCS_URL}components/status/`
    );
  }
  for (const stack of profile.stacks ?? []) sections.push(setupMarkdown(stack));
  if (profile.platform) {
    const items = Object.values(contracts).filter(contract => supports(contract, profile.platform));
    sections.push(
      [
        '## Components',
        '',
        `Every component of this package (status of planned ones: ${DOCS_URL}components/status/).`,
        '',
        ...items.map(contract => componentReference(contract, profile.platform)),
      ].join('\n')
    );
  }
  if (profile.contracts) {
    sections.push(
      [
        '## Contracts',
        '',
        'Each contract is the source of truth of a component on every platform (`contracts.<name>`).',
        '',
        ...Object.values(contracts).flatMap(contract => [
          `### \`${contract.name}\` (\`<${contract.tag}>\`)`,
          '',
          contract.description,
          '',
          contractMarkdown(contract),
          '',
        ]),
      ].join('\n')
    );
  }
  if (profile.themes) sections.push(themesSection(profile.platform));
  if (profile.tokens) sections.push(tokensSection());
  if (profile.mcp) {
    sections.push(
      [
        '## Use',
        '',
        fence(
          'json',
          JSON.stringify(
            { servers: { 'cosmos-ui': { type: 'stdio', command: 'npx', args: ['-y', name] } } },
            null,
            2
          )
        ),
        '',
        'Tools: `list_components`, `get_component`, `list_themes`, `get_tokens`, `get_setup`, `search_docs`. Resources: `cosmos://llms/<package>`.',
      ].join('\n')
    );
  }
  if (profile.cli) {
    sections.push(
      [
        '## Use',
        '',
        fence(
          'bash',
          'npx @joralvmel/cosmos-cli init-ai --stack react   # react | next | angular | html | react-native'
        ),
        '',
        'Writes a marked, regenerable block into `.github/copilot-instructions.md` and `AGENTS.md` (`--claude` adds `CLAUDE.md`) and registers the MCP server in `.vscode/mcp.json`.',
      ].join('\n')
    );
  }
  const stack = profile.stacks?.[0];
  sections.push(
    ['## Rules for AI assistants', '', ...aiRules(stack).map(rule => `- ${rule}`)].join('\n')
  );
  return `${START}\n\n${sections.join('\n\n')}\n\n${END}`;
}

/** Replaces (or appends) the generated block of a file's content. */
export function applyBlock(content, block) {
  const start = content.indexOf(START);
  const end = content.indexOf(END);
  if (start !== -1 && end > start) {
    return `${content.slice(0, start)}${block}${content.slice(end + END.length)}`;
  }
  return `${content.replace(/\s*$/, '')}\n\n${block}\n`;
}

/** Packages whose llms.md is outdated (or all, with `write: true` they are rewritten). */
export function syncLlms(root, { write = false } = {}) {
  const outdated = [];
  for (const pkg of Object.keys(profiles)) {
    const path = join(root, 'packages', pkg, 'llms.md');
    if (!existsSync(path)) {
      outdated.push(pkg);
      continue;
    }
    const content = readFileSync(path, 'utf8');
    const next = applyBlock(content, generateBlock(pkg));
    if (next !== content) {
      outdated.push(pkg);
      if (write) writeFileSync(path, next);
    }
  }
  return outdated;
}

function main() {
  const root = findRoot(fileURLToPath(new URL('.', import.meta.url)));
  const check = process.argv.includes('--check');
  const outdated = syncLlms(root, { write: !check });
  if (check && outdated.length > 0) {
    console.error(`Outdated llms.md: ${outdated.join(', ')}. Run \`npm run llms\`.`);
    process.exitCode = 1;
    return;
  }
  console.log(
    check ? 'llms.md files are up to date.' : `Updated: ${outdated.join(', ') || 'nothing to do'}`
  );
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
