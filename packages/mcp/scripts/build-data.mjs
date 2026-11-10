// Bundles the data the MCP server needs at runtime into dist/data/: component status, the AI
// references (packages/*/llms.md) and the English docs pages as Markdown (search index).
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mdxToMarkdown, splitFrontmatter } from '@joralvmel/cosmos-tools/ai';
import { findRoot, getStatusReport } from '@joralvmel/cosmos-tools/status';

const root = findRoot(fileURLToPath(new URL('.', import.meta.url)));
const dist = fileURLToPath(new URL('../dist/data/', import.meta.url));
mkdirSync(join(dist, 'llms'), { recursive: true });

const report = getStatusReport(root);
writeFileSync(join(dist, 'status.json'), `${JSON.stringify(report)}\n`);

for (const pkg of readdirSync(join(root, 'packages'))) {
  const file = join(root, 'packages', pkg, 'llms.md');
  try {
    writeFileSync(join(dist, 'llms', `${pkg}.md`), readFileSync(file, 'utf8'));
  } catch {
    // Packages without an AI reference are skipped.
  }
}

const docsRoot = join(root, 'apps/docs/src/content/docs');
const pages = [];
const walk = dir => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      if (!(dir === docsRoot && name === 'es')) walk(path);
    } else if (/\.mdx?$/.test(name)) {
      const source = readFileSync(path, 'utf8');
      const slug = relative(docsRoot, path)
        .replaceAll('\\', '/')
        .replace(/\.mdx?$/, '');
      pages.push({
        slug: slug === 'index' ? '' : slug,
        title: splitFrontmatter(source).data.title ?? slug,
        markdown: mdxToMarkdown(source, { report }),
      });
    }
  }
};
walk(docsRoot);
writeFileSync(join(dist, 'docs.json'), `${JSON.stringify(pages)}\n`);
console.log(`MCP data: ${report.components.length} components, ${pages.length} docs pages.`);
