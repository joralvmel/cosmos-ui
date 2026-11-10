import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compile } from 'tailwindcss';
import { beforeAll, describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const indexCss = fileURLToPath(new URL('../dist/index.css', import.meta.url));

async function build(candidates: string[]) {
  const compiler = await compile(
    '@import "tailwindcss/theme.css" layer(theme);\n@import "tailwindcss/utilities.css" layer(utilities);\n@import "cosmos";',
    {
      base: dirname(indexCss),
      async loadStylesheet(id) {
        const path = id === 'cosmos' ? indexCss : require.resolve(id);
        return { path, base: dirname(path), content: await readFile(path, 'utf8') };
      },
    }
  );
  return compiler.build(candidates);
}

describe('Cosmos Tailwind theme', () => {
  let css = '';
  beforeAll(async () => {
    css = await build([
      'bg-primary',
      'text-fg-muted',
      'rounded-md',
      'shadow-lg',
      'p-4',
      'gap-sm',
      'dark:bg-surface',
      'theme-nebula:text-accent',
      'bg-blue-500',
    ]);
  });

  it('maps utilities to Cosmos variables', () => {
    expect(css).toContain('background-color: var(--cosm-primary)');
    expect(css).toContain('color: var(--cosm-fg-muted)');
    expect(css).toContain('border-radius: var(--cosm-radius-md)');
    expect(css).toContain('var(--cosm-shadow-lg)');
    expect(css).toMatch(/padding: calc\(var\(--cosm-space-unit\) \* 4\)/);
  });

  it('supports the dark and per-theme variants', () => {
    expect(css).toContain('[data-mode="dark"]');
    expect(css).toContain('[data-mode="system"]');
    expect(css).toContain('[data-theme="nebula"]');
  });

  it('removes default palette colors so only tokens are used', () => {
    expect(css).not.toContain('.bg-blue-500');
  });

  it('ships the tokens in the self-contained stylesheet', async () => {
    const content = await readFile(indexCss, 'utf8');
    expect(content).toContain('--cosm-primary:');
    expect(content).toContain('@theme inline');
  });
});
