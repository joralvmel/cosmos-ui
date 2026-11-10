import { describe, expect, it } from 'vitest';
import { run } from '../src/index.js';

function capture(args: string[]) {
  const out: string[] = [];
  const err: string[] = [];
  const code = run(args, { out: line => out.push(line), err: line => err.push(line) }, '1.2.3');
  return { code, out: out.join('\n'), err: err.join('\n') };
}

describe('cosmos CLI', () => {
  it('prints help by default', () => {
    const result = capture([]);
    expect(result.code).toBe(0);
    expect(result.out).toContain('Usage: cosmos <command>');
  });

  it('prints the version', () => {
    expect(capture(['--version'])).toMatchObject({ code: 0, out: '1.2.3' });
  });

  it('fails on unknown commands', () => {
    const result = capture(['nope']);
    expect(result.code).toBe(1);
    expect(result.err).toContain('Unknown command "nope"');
  });
});
