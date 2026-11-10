import { describe, expect, it } from 'vitest';
import { aiRules, DOCS_URL, isStack, setupGuide, setupMarkdown, stacks } from '../src/index.js';

describe('setup guides', () => {
  it('cover every stack with a docs guide', () => {
    for (const stack of stacks) {
      const guide = setupGuide(stack);
      expect(guide.stack).toBe(stack);
      expect(guide.steps.length).toBeGreaterThan(0);
      expect(guide.guide).toMatch(/^guides\/[a-z-]+\/$/);
    }
  });

  it('render Markdown with install commands, code and the guide link', () => {
    const markdown = setupMarkdown('next');
    expect(markdown).toContain('## Setup: Next.js (App Router)');
    expect(markdown).toContain('npm install @joralvmel/cosmos-react @joralvmel/cosmos-tokens');
    expect(markdown).toContain("'use client';");
    expect(markdown).toContain(`${DOCS_URL}guides/nextjs/`);
  });

  it('validates stack names', () => {
    expect(isStack('angular')).toBe(true);
    expect(isStack('vue')).toBe(false);
  });

  it('adds stack rules to the common AI rules', () => {
    expect(aiRules().length).toBeLessThan(aiRules('react-native').length);
    expect(aiRules('react-native').join('\n')).toContain('CosmosThemeProvider');
  });
});
