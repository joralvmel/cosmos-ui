import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import { mdxToMarkdown, splitFrontmatter } from '../ai/page-markdown.mjs';
import { getStatusReport, ROOT } from '../status/component-status.mjs';

const docs = join(ROOT, 'apps/docs/src/content/docs');
const report = getStatusReport();
const pages = [];
const walk = dir => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (/\.mdx?$/.test(name)) pages.push(relative(docs, path).replaceAll('\\', '/'));
  }
};
walk(docs);
const convert = page => mdxToMarkdown(readFileSync(join(docs, page), 'utf8'), { report });

describe('MDX to Markdown', () => {
  it('reads the frontmatter', () => {
    expect(splitFrontmatter('---\ntitle: "A: B"\ndescription: x\n---\nBody').data).toEqual({
      title: 'A: B',
      description: 'x',
    });
  });

  it.each(pages)('%s has no imports or docs components left', page => {
    const markdown = convert(page);
    expect(markdown).toMatch(/^# \S/);
    expect(markdown).not.toMatch(/^import .*(\.astro|@astrojs\/starlight\/components)';$/m);
    expect(markdown).not.toMatch(
      /<(?:Playground|ApiTable|EventsTable|StatusBadge|StatusTable|ThemeGallery|SetupSteps|AgentsTable|Preview|Steps|Tabs|TabItem|Card|CardGrid)\b/
    );
  });

  it('turns component docs into generated Markdown', () => {
    const markdown = convert('components/button.mdx');
    expect(markdown).toContain('Status: **stable**');
    expect(markdown).toContain('**React Native**');
    expect(markdown).toContain('| `variant` |');
    expect(markdown).toContain('| `cosm-press` | `onPress` | `(press)` |');
    expect(markdown).toContain('```html\n<cosm-button>Solid</cosm-button>');
  });

  it('keeps tab contents as normal Markdown', () => {
    const markdown = convert('getting-started/installation.mdx');
    expect(markdown).toContain('**React**');
    expect(markdown).toMatch(/^```bash$/m);
  });
});
