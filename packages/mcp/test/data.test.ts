import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  createServer,
  getComponent,
  getSetup,
  getTokens,
  listComponents,
  listThemes,
  searchDocs,
} from '../src/index.js';

describe('MCP tools (data layer)', () => {
  it('lists catalog components with their status', () => {
    const button = listComponents().find(item => item.name === 'button');
    expect(button).toMatchObject({ tag: 'cosm-button', status: 'stable' });
    expect(listComponents().find(item => item.name === 'select')?.dependsOn).toContain('popover');
  });

  it('returns a component with snippets for the four platforms', () => {
    const button = getComponent('button');
    expect(Object.keys(button?.snippets ?? {})).toEqual(['html', 'react', 'angular', 'native']);
    expect(button?.contract?.events.press?.names.react).toBe('onPress');
    expect(button?.api).toContain('| `variant` |');
    expect(getComponent('select')?.contract).toBeUndefined();
    expect(getComponent('constructor')).toBeUndefined();
  });

  it('lists themes and tokens', () => {
    expect(listThemes().map(theme => theme.name)).toContain('nebula');
    expect(getTokens('nebula', 'dark')?.colors['--cosm-primary']).toMatch(/^oklch\(/);
    expect(getTokens('unknown')).toBeUndefined();
  });

  it('returns setup guides and searches the docs', () => {
    expect(getSetup('angular')).toContain('CosmButtonComponent');
    const results = searchDocs('trusted publishing provenance');
    expect(results[0]?.url).toMatch(/contribute\/publishing\/$/);
    expect(searchDocs('')).toEqual([]);
  });
});

describe('MCP server', () => {
  const client = new Client({ name: 'test', version: '0.0.0' });

  beforeAll(async () => {
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await createServer().connect(serverTransport);
    await client.connect(clientTransport);
  });

  afterAll(async () => {
    await client.close();
  });

  it('exposes the documented tools', async () => {
    const { tools } = await client.listTools();
    expect(tools.map(tool => tool.name).sort()).toEqual([
      'get_component',
      'get_setup',
      'get_tokens',
      'list_components',
      'list_themes',
      'search_docs',
    ]);
  });

  it('answers tool calls', async () => {
    const result = await client.callTool({ name: 'get_component', arguments: { name: 'button' } });
    const [content] = result.content as { type: string; text: string }[];
    expect(JSON.parse(content?.text ?? '{}').snippets.angular).toContain('(press)=');
    const unknown = await client.callTool({ name: 'get_component', arguments: { name: 'nope' } });
    expect(unknown.isError).toBe(true);
  });

  it('serves llms.md resources', async () => {
    const { resources } = await client.listResources();
    expect(resources.map(resource => resource.uri)).toContain('cosmos://llms/react');
    const { contents } = await client.readResource({ uri: 'cosmos://llms/react' });
    expect((contents[0] as { text: string }).text).toContain('# @joralvmel/cosmos-react');
  });
});
