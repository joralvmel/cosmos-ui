import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { contracts, setupGuide, stacks, supports } from '@joralvmel/cosmos-core';
import { describe, expect, it } from 'vitest';
import { t } from '../src/components/i18n';

const docs = fileURLToPath(new URL('../src/content/docs/', import.meta.url));

function pages(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === 'es' && dir === docs ? [] : pages(path);
    return /\.mdx?$/.test(entry.name) ? [relative(docs, path).replaceAll('\\', '/')] : [];
  });
}

describe('framework guides', () => {
  it('exist for every stack in English and Spanish and render the shared setup steps', () => {
    for (const stack of stacks) {
      const slug = setupGuide(stack).guide.replace(/\/$/, '');
      for (const locale of ['', 'es/']) {
        const file = join(docs, `${locale}${slug}.mdx`);
        expect(existsSync(file), file).toBe(true);
        expect(readFileSync(file, 'utf8')).toContain(`<SetupSteps stack="${stack}" />`);
      }
    }
  });

  it('translate every setup step title', () => {
    const titles = t('es').setupTitles as Record<string, string>;
    for (const stack of stacks) {
      for (const step of setupGuide(stack).steps)
        expect(titles[step.title], step.title).toBeTruthy();
    }
  });
});

describe('docs content', () => {
  it('has a Spanish page for every English page', () => {
    const missing = pages(docs).filter(page => !existsSync(join(docs, 'es', page)));
    expect(missing).toEqual([]);
  });

  it('documents every web component contract with playground and API table', () => {
    for (const contract of Object.values(contracts).filter(item => supports(item, 'web'))) {
      const name = contract.name;
      for (const locale of ['', 'es/']) {
        const file = join(docs, `${locale}components/${name}.mdx`);
        expect(existsSync(file), file).toBe(true);
        const content = readFileSync(file, 'utf8');
        expect(content).toContain(`<ApiTable name="${name}" />`);
        expect(content).toContain(`<Playground name="${name}"`);
        expect(content).toContain(`<StatusBadge name="${name}" />`);
      }
    }
  });
});
