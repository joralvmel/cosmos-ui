// Publishes the AI references next to the built site:
//   /ai/<package>.md   the llms.md of every package
//   /llms.txt          index for assistants (llmstxt.org format)
//   /llms-full.txt     every English page and package reference in one file
// The `.md` version of each page is produced by src/pages/[...slug].md.ts during the Astro build.
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const site = (
  process.env.COSMOS_DOCS_URL?.trim() || 'https://joralvmel.github.io/cosmos-ui/'
).replace(/\/?$/, '/');

mkdirSync(join(dist, 'ai'), { recursive: true });
const packages = [];
for (const name of readdirSync(join(root, 'packages')).sort()) {
  const source = join(root, 'packages', name, 'llms.md');
  if (!existsSync(source)) continue;
  copyFileSync(source, join(dist, 'ai', `${name}.md`));
  const intro =
    readFileSync(source, 'utf8')
      .split('\n')
      .find(line => line.trim() && !line.startsWith('#')) ?? '';
  packages.push({ name, intro: intro.split('. ')[0].replace(/\.$/, '') });
}

const pages = [];
const walk = dir => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const rel = relative(dist, path).replaceAll('\\', '/');
    if (statSync(path).isDirectory()) {
      if (!['es', 'ai', '_astro', 'pagefind'].includes(rel)) walk(path);
    } else if (name.endsWith('.md') && rel !== 'es.md') {
      const text = readFileSync(path, 'utf8');
      const title = /^# (.+)$/m.exec(text)?.[1] ?? rel;
      const description = /^> (.+)$/m.exec(text)?.[1] ?? '';
      pages.push({
        rel,
        title,
        description,
        text,
        section: rel.includes('/') ? rel.split('/')[0] : 'overview',
      });
    }
  }
};
walk(dist);
pages.sort((a, b) => a.rel.localeCompare(b.rel));

const sectionTitles = {
  overview: 'Overview',
  'getting-started': 'Getting started',
  guides: 'Framework guides',
  theming: 'Theming',
  components: 'Components',
  ai: 'Use with AI',
  contribute: 'Contribute',
};
const sections = [...new Set(pages.map(page => page.section))].sort(
  (a, b) => Object.keys(sectionTitles).indexOf(a) - Object.keys(sectionTitles).indexOf(b)
);

const llms = [
  '# Cosmos UI',
  '',
  '> Themeable design system: one contract per component, implemented as Web Components (Lit), React and Angular wrappers and React Native components. OKLCH themes with light and dark modes, validated for WCAG 2.2 AA.',
  '',
  'Rules: style with Cosmos tokens (`var(--cosm-*)` or the Tailwind theme utilities), set `data-theme` and `data-mode` on the root element, prefer existing components (see the component status page), never render untrusted HTML.',
  '',
  '## Packages',
  '',
  ...packages.map(
    pkg => `- [@joralvmel/cosmos-${pkg.name}](${site}ai/${pkg.name}.md): ${pkg.intro}`
  ),
  '',
  ...sections.flatMap(section => [
    `## ${sectionTitles[section] ?? section}`,
    '',
    ...pages
      .filter(page => page.section === section)
      .map(
        page =>
          `- [${page.title}](${site}${page.rel})${page.description ? `: ${page.description}` : ''}`
      ),
    '',
  ]),
  '## Optional',
  '',
  `- [Everything in one file](${site}llms-full.txt)`,
  '- MCP server: `npx -y @joralvmel/cosmos-mcp` (tools: list_components, get_component, list_themes, get_tokens, get_setup, search_docs)',
  '',
];
writeFileSync(join(dist, 'llms.txt'), llms.join('\n'));

const full = [
  ...pages.map(page => page.text.trim()),
  ...packages.map(pkg => readFileSync(join(dist, 'ai', `${pkg.name}.md`), 'utf8').trim()),
].join('\n\n---\n\n');
writeFileSync(join(dist, 'llms-full.txt'), `${full}\n`);

console.log(
  `AI references: ${packages.length} packages, ${pages.length} pages (llms.txt, llms-full.txt).`
);
