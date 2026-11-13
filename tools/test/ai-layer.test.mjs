import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
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
const workflowPath = fileURLToPath(
  new URL('../../docs/conventions/component-workflow.md', import.meta.url)
);

describe('AI layer files', () => {
  it.each(agents)('agent %s has name, description and tools', file => {
    const data = frontmatter(read('agents', file));
    expect(data?.name).toBe(file.replace('.agent.md', ''));
    expect(data?.description).toBeTruthy();
    expect(data?.tools).toMatch(/^\[.*\]$/);
  });

  describe('component workflow approval gates', () => {
    const workflow = readFileSync(workflowPath, 'utf8');

    it('orders research and scope approval before implementation, then local review before delivery', () => {
      const phases = [
        '## 1. Research before decisions',
        '## 2. Scope approval gate',
        '## 3. Implement the accepted scope',
        '## 4. Validate with evidence',
        '## 5. Local commit and review gate',
        '## 6. Approved push and pull request',
      ];
      let previous = -1;
      for (const phase of phases) {
        const position = workflow.indexOf(phase);
        expect(position, phase).toBeGreaterThan(previous);
        previous = position;
      }
      expect(workflow).toMatch(/STOP for explicit user approval before generating files/);
      expect(workflow).toMatch(/STOP after the local commit\. Do not push or create a PR/);
      expect(workflow).toMatch(/previous\s+approval does not carry over to changed code/);
    });

    it('keeps finish-work local and puts the reviewed HEAD check before remote commands in open-pr', () => {
      const finish = read('skills', 'finish-work', 'SKILL.md');
      expect(finish.indexOf('**local Conventional Commit**')).toBeGreaterThan(-1);
      expect(finish.indexOf('**STOP for user validation.')).toBeGreaterThan(
        finish.indexOf('**local Conventional Commit**')
      );
      expect(finish).not.toMatch(/`(?:git push|gh pr create)\b/);
      expect(finish).toContain('**new commit**');

      const open = read('skills', 'open-pr', 'SKILL.md');
      const approval = open.indexOf('Confirm explicit user approval for the current reviewed HEAD');
      expect(approval).toBeGreaterThan(-1);
      expect(open.indexOf('git push')).toBeGreaterThan(approval);
      expect(open).toContain('git status --porcelain');
      expect(open).toContain('Reuse an existing open PR');
    });

    it('resolves workflow links from all participating skills and agents to the shared convention', () => {
      const files = [
        ...[
          'research-reference',
          'create-component',
          'modify-component',
          'define-contract',
          'design-component',
          'component-from-design',
          'create-native-component',
          'create-chart',
          'component-status',
          'add-contract-tests',
          'audit-a11y',
          'add-playground',
          'start-work',
          'commit',
          'finish-work',
          'open-pr',
        ].map(name => join(github, 'skills', name, 'SKILL.md')),
        ...[
          'researcher',
          'architect',
          'design-system',
          'component-builder',
          'chart-builder',
          'native-expert',
          'test-engineer',
          'reviewer',
          'github-ops',
        ].map(name => join(github, 'agents', `${name}.agent.md`)),
        ...['create-component', 'finish-work', 'open-pr'].map(name =>
          join(github, 'prompts', `${name}.prompt.md`)
        ),
        join(github, 'copilot-instructions.md'),
        resolve(github, '..', 'AGENTS.md'),
      ];
      for (const file of files) {
        const link = /\]\(([^)]+component-workflow\.md)\)/.exec(readFileSync(file, 'utf8'))?.[1];
        expect(link, file).toBeTruthy();
        expect(resolve(dirname(file), link ?? ''), file).toBe(workflowPath);
      }
    });

    it('gives coordinating roles delegation/questions and test roles actual browser tools', () => {
      for (const name of [
        'component-builder',
        'architect',
        'design-system',
        'chart-builder',
        'native-expert',
      ]) {
        const tools = frontmatter(read('agents', `${name}.agent.md`))?.tools ?? '';
        expect(tools, name).toContain("'agent'");
        expect(tools, name).toContain("'vscode/askQuestions'");
      }
      for (const name of ['test-engineer', 'native-expert']) {
        const tools = frontmatter(read('agents', `${name}.agent.md`))?.tools ?? '';
        expect(tools, name).toContain("'browser/openBrowserPage'");
        expect(tools, name).toContain("'browser/runPlaywrightCode'");
      }
    });
  });

  it('uses references one decision at a time through the existing workflows', () => {
    const skill = read('skills', 'use-reference', 'SKILL.md');
    const conventionPath = resolve(github, '..', 'docs', 'conventions', 'reference-projects.md');
    const convention = readFileSync(conventionPath, 'utf8');
    const files = [
      join(github, 'skills', 'use-reference', 'SKILL.md'),
      join(github, 'agents', 'researcher.agent.md'),
      join(github, 'agents', 'design-system.agent.md'),
      workflowPath,
      resolve(github, '..', 'AGENTS.md'),
    ];
    for (const file of files) {
      const link = /\]\(([^)]*reference-projects\.md)\)/.exec(readFileSync(file, 'utf8'))?.[1];
      expect(link, file).toBeTruthy();
      expect(resolve(dirname(file), link ?? ''), file).toBe(conventionPath);
    }
    const discovery = skill.indexOf('Establish read-only source boundaries');
    const approval = skill.indexOf('STOP for explicit user approval before generation or edits');
    const implementation = skill.indexOf('After approval, the selected skill implements');
    expect(discovery).toBeGreaterThan(-1);
    expect(approval).toBeGreaterThan(discovery);
    expect(implementation).toBeGreaterThan(approval);
    for (const name of ['add-theme', 'create-component', 'modify-component']) {
      expect(skills).toContain(name);
      expect(skill).toContain(`\`${name}\``);
    }
    expect(skill).toContain('do not map or create components in batch');
    expect(convention).toContain('`modes.light` / `modes.dark` overrides');
    expect(convention).toContain('React/Angular wrap web components; they are not React Native');
    expect(convention).toContain('Finish implementation with a verified local commit');
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
