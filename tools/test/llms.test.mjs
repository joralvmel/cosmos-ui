import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { contracts, eventNames, propNames, supports } from '@joralvmel/cosmos-core';
import { describe, expect, it } from 'vitest';
import { applyBlock, END, generateBlock, profiles, START, syncLlms } from '../ai/llms.mjs';
import { ROOT } from '../status/component-status.mjs';

const read = pkg => readFileSync(join(ROOT, 'packages', pkg, 'llms.md'), 'utf8');
const platformPackages = { web: 'elements', react: 'react', angular: 'angular', native: 'native' };
const domPlatform = { web: 'dom', react: 'react', angular: 'angular', native: 'native' };

describe('llms.md references', () => {
  it('are up to date (run `npm run llms`)', () => {
    expect(syncLlms(ROOT)).toEqual([]);
  });

  it('exist for every publishable package with a profile', () => {
    for (const pkg of Object.keys(profiles)) expect(read(pkg)).toContain(START);
  });

  it('document every prop and event of every component on each platform', () => {
    for (const [platform, pkg] of Object.entries(platformPackages)) {
      const text = read(pkg);
      for (const contract of Object.values(contracts).filter(item => supports(item, platform))) {
        for (const prop of propNames(contract, platform)) {
          expect(text, `${pkg}: ${contract.name}.${prop}`).toContain(`| \`${prop}\``);
        }
        for (const event of eventNames(contract, domPlatform[platform])) {
          expect(text, `${pkg}: ${contract.name} ${event}`).toContain(event);
        }
      }
    }
  });

  it('include setup, themes and AI rules', () => {
    const react = read('react');
    expect(react).toContain('## Setup: React (Vite)');
    expect(react).toContain('## Setup: Next.js (App Router)');
    expect(react).toContain('## Themes');
    expect(react).toContain('## Rules for AI assistants');
  });

  it('replaces only the generated block', () => {
    const block = generateBlock('i18n');
    const content = `# Title\n\nIntro.\n\n${START}\nold\n${END}\n\nFooter.\n`;
    const updated = applyBlock(content, block);
    expect(updated.startsWith('# Title\n\nIntro.\n\n')).toBe(true);
    expect(updated).toContain('Footer.');
    expect(updated).not.toContain('old');
    expect(applyBlock('# Title\n', block)).toBe(`# Title\n\n${block}\n`);
  });
});
