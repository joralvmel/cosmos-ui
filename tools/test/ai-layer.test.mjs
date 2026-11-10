import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const github = fileURLToPath(new URL('../../.github/', import.meta.url));

/** Minimal frontmatter reader: `key: value` lines between the first two `---` lines. */
export function frontmatter(text) {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(text);
  if (!match) return undefined;
  return Object.fromEntries(
    match[1].split('\n').map(line => {
      const index = line.indexOf(':');
      return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
    })
  );
}

const read = (...parts) => readFileSync(join(github, ...parts), 'utf8');
const agents = readdirSync(join(github, 'agents'));
const skills = readdirSync(join(github, 'skills'));
const prompts = readdirSync(join(github, 'prompts'));
const instructions = readdirSync(join(github, 'instructions'));

describe('AI layer files', () => {
  it.each(agents)('agent %s has name, description and tools', file => {
    const data = frontmatter(read('agents', file));
    expect(data?.name).toBe(file.replace('.agent.md', ''));
    expect(data?.description).toBeTruthy();
    expect(data?.tools).toMatch(/^\[.*\]$/);
  });

  it.each(skills)('skill %s has name and description and a prompt', skill => {
    const data = frontmatter(read('skills', skill, 'SKILL.md'));
    expect(data?.name).toBe(skill);
    expect(data?.description).toBeTruthy();
    expect(prompts).toContain(`${skill}.prompt.md`);
  });

  it.each(prompts)('prompt %s has name, description and agent mode', file => {
    const data = frontmatter(read('prompts', file));
    expect(data?.name).toBe(file.replace('.prompt.md', ''));
    expect(data?.description).toBeTruthy();
    expect(data?.agent).toBe('agent');
  });

  it.each(instructions)('instructions %s declare applyTo', file => {
    expect(frontmatter(read('instructions', file))?.applyTo).toMatch(/^'.+'$/);
  });

  it('agents only reference existing skills', () => {
    for (const file of agents) {
      const skillLine = /\*\*Skills:\*\* (.*)/.exec(read('agents', file))?.[1] ?? '';
      for (const [, name] of skillLine.matchAll(/`([a-z-]+)`/g)) {
        expect(skills, `${file} → ${name}`).toContain(name);
      }
    }
  });
});
