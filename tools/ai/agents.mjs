// Reads the agents and skills of .github/ (name, description, skills, main agent). Used by the docs
// ("Working with agents") and the Markdown version of the pages.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

function frontmatter(text) {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(text.replace(/\r\n/g, '\n'));
  const data = {};
  for (const line of match?.[1].split('\n') ?? []) {
    const index = line.indexOf(':');
    if (index > 0) {
      data[line.slice(0, index).trim()] = line
        .slice(index + 1)
        .trim()
        .replace(/^'(.*)'$/, '$1')
        .replaceAll("''", "'");
    }
  }
  return data;
}

export function listAgents(root) {
  const dir = join(root, '.github/agents');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter(file => file.endsWith('.agent.md'))
    .map(file => {
      const text = readFileSync(join(dir, file), 'utf8');
      const data = frontmatter(text);
      const skills = /\*\*Skills:\*\* (.*)/.exec(text)?.[1] ?? '';
      return {
        name: data.name ?? file.replace('.agent.md', ''),
        description: data.description ?? '',
        skills: [...skills.matchAll(/`([a-z-]+)`/g)].map(match => match[1]),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function listSkills(root) {
  const dir = join(root, '.github/skills');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter(name => existsSync(join(dir, name, 'SKILL.md')))
    .map(name => {
      const text = readFileSync(join(dir, name, 'SKILL.md'), 'utf8');
      const data = frontmatter(text);
      return {
        name,
        description: data.description ?? '',
        agent: /Main agent: `([a-z-]+)`/.exec(text)?.[1] ?? '',
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

const cell = value => value.replaceAll('|', '\\|');

export function agentsMarkdown(root) {
  return [
    '| Agent | What it does | Skills |',
    '| --- | --- | --- |',
    ...listAgents(root).map(
      agent =>
        `| \`${agent.name}\` | ${cell(agent.description)} | ${agent.skills.map(skill => `\`${skill}\``).join(', ') || '—'} |`
    ),
  ].join('\n');
}

export function skillsMarkdown(root) {
  return [
    '| Skill (prompt) | Main agent | What it does |',
    '| --- | --- | --- |',
    ...listSkills(root).map(
      skill => `| \`/${skill.name}\` | \`${skill.agent}\` | ${cell(skill.description)} |`
    ),
  ].join('\n');
}
