import { readFileSync } from 'node:fs';
import { stacks } from '@joralvmel/cosmos-core';
import { builtInThemes } from '@joralvmel/cosmos-tokens';
import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { loadData } from './data.js';
import {
  getComponent,
  getSetup,
  getTokens,
  listComponents,
  listThemes,
  searchDocs,
} from './tools.js';

const text = (value: unknown) => ({
  content: [
    {
      type: 'text' as const,
      text: typeof value === 'string' ? value : JSON.stringify(value, null, 2),
    },
  ],
});

const version = (): string =>
  JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version;

/** Creates the Cosmos UI MCP server (tools + `cosmos://llms/<package>` resources). */
export function createServer(): McpServer {
  const server = new McpServer({ name: 'cosmos-ui', version: version() });

  server.registerTool(
    'list_components',
    {
      title: 'List components',
      description:
        'Every Cosmos UI component (implemented and planned) with category, platforms, dependencies and status (planned | in-progress | stable).',
      inputSchema: { status: z.enum(['planned', 'in-progress', 'stable']).optional() },
    },
    async ({ status }) => text(listComponents().filter(item => !status || item.status === status))
  );

  server.registerTool(
    'get_component',
    {
      title: 'Get component',
      description:
        'Contract (props, events per platform, slots, parts, keyboard), API table, usage snippets for HTML, React, Angular and React Native, imports and status of one component.',
      inputSchema: { name: z.string().describe('kebab-case name, e.g. "button"') },
    },
    async ({ name }) => {
      const component = getComponent(name);
      return component
        ? text(component)
        : { ...text(`Unknown component "${name}". Use list_components.`), isError: true };
    }
  );

  server.registerTool(
    'list_themes',
    {
      title: 'List themes',
      description: 'Built-in themes; every theme has light and dark modes (system follows the OS).',
      inputSchema: {},
    },
    async () => text(listThemes())
  );

  server.registerTool(
    'get_tokens',
    {
      title: 'Get tokens',
      description: 'Semantic color tokens (--cosm-*) and radii of a theme and mode.',
      inputSchema: {
        theme: z.enum(builtInThemes.map(theme => theme.name) as [string, ...string[]]).optional(),
        mode: z.enum(['light', 'dark']).optional(),
      },
    },
    async ({ theme, mode }) => text(getTokens(theme, mode) ?? `Unknown theme "${theme}".`)
  );

  server.registerTool(
    'get_setup',
    {
      title: 'Get setup',
      description: 'Install commands, setup code and rules for a framework.',
      inputSchema: { framework: z.enum(stacks) },
    },
    async ({ framework }) => text(getSetup(framework))
  );

  server.registerTool(
    'search_docs',
    {
      title: 'Search docs',
      description: 'Keyword search over the Cosmos UI documentation and AI references.',
      inputSchema: {
        query: z.string().min(1),
        limit: z.number().int().min(1).max(20).optional(),
      },
    },
    async ({ query, limit }) => text(searchDocs(query, limit))
  );

  server.registerResource(
    'llms',
    new ResourceTemplate('cosmos://llms/{package}', {
      list: async () => ({
        resources: Object.keys(loadData().llms).map(pkg => ({
          uri: `cosmos://llms/${pkg}`,
          name: `@joralvmel/cosmos-${pkg} llms.md`,
          mimeType: 'text/markdown',
        })),
      }),
    }),
    {
      title: 'AI references (llms.md)',
      description: 'Concise reference of each Cosmos UI package for AI assistants.',
      mimeType: 'text/markdown',
    },
    async (uri, variables) => {
      const pkg = String(variables.package);
      const content = loadData().llms[pkg];
      if (content === undefined) throw new Error(`Unknown package "${pkg}"`);
      return { contents: [{ uri: uri.href, mimeType: 'text/markdown', text: content }] };
    }
  );

  return server;
}
