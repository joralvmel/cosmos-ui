import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { BLOCK_END, BLOCK_START, mergeMcpConfig, run, upsertBlock } from '../src/index.js';

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'cosmos-cli-'));
});
afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

function capture(args: string[]) {
  const out: string[] = [];
  const err: string[] = [];
  const code = run(
    args,
    { out: line => out.push(line), err: line => err.push(line), cwd: dir },
    '1.2.3'
  );
  return { code, out: out.join('\n'), err: err.join('\n') };
}

const read = (path: string) => readFileSync(join(dir, path), 'utf8');

describe('cosmos CLI', () => {
  it('prints help by default and the version', () => {
    expect(capture([]).out).toContain('Usage: cosmos <command>');
    expect(capture(['--version'])).toMatchObject({ code: 0, out: '1.2.3' });
  });

  it('fails on unknown commands and stacks', () => {
    expect(capture(['nope'])).toMatchObject({ code: 1 });
    expect(capture(['init-ai']).err).toContain('--stack');
    expect(capture(['init-ai', '--stack', 'vue']).code).toBe(1);
  });
});

describe('init-ai', () => {
  it('writes the instructions block, registers the MCP server and prints the setup steps', () => {
    const result = capture(['init-ai', '--stack', 'next']);
    expect(result.code).toBe(0);
    expect(result.out).toContain('created   .github/copilot-instructions.md');
    expect(result.out).toContain('$ npm install @joralvmel/cosmos-react @joralvmel/cosmos-tokens');
    expect(read('.github/copilot-instructions.md')).toContain(
      "only in Client Components (`'use client'`)"
    );
    expect(read('AGENTS.md')).toContain(BLOCK_START);
    expect(existsSync(join(dir, 'CLAUDE.md'))).toBe(false);
    expect(JSON.parse(read('.vscode/mcp.json')).servers['cosmos-ui']).toEqual({
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@joralvmel/cosmos-mcp'],
    });
  });

  it('is idempotent and keeps the rest of the files', () => {
    writeFileSync(join(dir, 'AGENTS.md'), '# My project\n\nOwn rules.\n');
    mkdirSync(join(dir, '.vscode'));
    writeFileSync(
      join(dir, '.vscode/mcp.json'),
      JSON.stringify({ servers: { other: { command: 'x' } } })
    );
    capture(['init-ai', '--stack', 'react']);
    const second = capture(['init-ai', '--stack', 'react']);
    expect(second.out).toContain('unchanged AGENTS.md');
    expect(
      read('AGENTS.md').startsWith('# My project\n\nOwn rules.\n\n<!-- cosmos-ui:start -->')
    ).toBe(true);
    expect(read('AGENTS.md').match(/cosmos-ui:start/g)).toHaveLength(1);
    expect(Object.keys(JSON.parse(read('.vscode/mcp.json')).servers)).toEqual([
      'other',
      'cosmos-ui',
    ]);
  });

  it('regenerates the block for another stack', () => {
    capture(['init-ai', '--stack', 'react']);
    capture(['init-ai', '--stack', 'angular']);
    const agents = read('AGENTS.md');
    expect(agents).toContain('@joralvmel/cosmos-angular');
    expect(agents).not.toContain('--stack react');
  });

  it('supports CLAUDE.md, skipping files and dry runs', () => {
    capture(['init-ai', '--stack', 'react-native', '--claude', '--no-copilot', '--no-mcp']);
    expect(read('CLAUDE.md')).toContain('CosmosThemeProvider');
    expect(existsSync(join(dir, '.github'))).toBe(false);
    expect(existsSync(join(dir, '.vscode'))).toBe(false);
    rmSync(join(dir, 'AGENTS.md'));
    const dry = capture(['init-ai', '--stack', 'html', '--dry-run']);
    expect(dry.out).toContain('(dry run) created   AGENTS.md');
    expect(existsSync(join(dir, 'AGENTS.md'))).toBe(false);
  });

  it('refuses to overwrite an mcp.json it cannot parse', () => {
    expect(() => mergeMcpConfig('{ // comment\n}')).toThrow(/not plain JSON/);
    mkdirSync(join(dir, '.vscode'));
    writeFileSync(join(dir, '.vscode/mcp.json'), '{ // comment\n}');
    expect(capture(['init-ai', '--stack', 'html']).code).toBe(1);
    expect(read('.vscode/mcp.json')).toBe('{ // comment\n}');
  });

  it('replaces only the marked block', () => {
    const block = `${BLOCK_START}\nnew\n${BLOCK_END}`;
    expect(upsertBlock(`a\n${BLOCK_START}\nold\n${BLOCK_END}\nb`, block)).toBe(`a\n${block}\nb`);
    expect(upsertBlock('', block)).toBe(`${block}\n`);
  });
});
