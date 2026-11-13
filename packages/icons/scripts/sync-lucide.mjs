import { execFileSync } from 'node:child_process';
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = resolve(
  dirname(fileURLToPath(import.meta.resolve('@lucide/icons'))),
  '..',
  '..'
);
const sourceDir = join(sourceRoot, 'dist', 'esm', 'icons');
const allowedTags = new Set(['path', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'rect']);
const allowedAttributes = new Set([
  'cx',
  'cy',
  'd',
  'fill',
  'height',
  'points',
  'r',
  'rx',
  'ry',
  'width',
  'x',
  'x1',
  'x2',
  'y',
  'y1',
  'y2',
]);
const reservedWords = new Set([
  'abstract',
  'arguments',
  'await',
  'boolean',
  'break',
  'byte',
  'case',
  'catch',
  'char',
  'class',
  'const',
  'continue',
  'debugger',
  'default',
  'delete',
  'do',
  'double',
  'else',
  'enum',
  'eval',
  'export',
  'extends',
  'false',
  'final',
  'finally',
  'float',
  'for',
  'function',
  'goto',
  'if',
  'implements',
  'import',
  'in',
  'instanceof',
  'int',
  'interface',
  'let',
  'long',
  'native',
  'new',
  'null',
  'package',
  'private',
  'protected',
  'public',
  'return',
  'short',
  'static',
  'super',
  'switch',
  'synchronized',
  'this',
  'throw',
  'throws',
  'transient',
  'true',
  'try',
  'typeof',
  'var',
  'void',
  'volatile',
  'while',
  'with',
  'yield',
]);
const categoryRules = [
  ['accessibility', /\b(accessibility|wheelchair|ear|eye|vision|sign-language)\b/],
  ['arrows', /\b(arrow|move|rotate|turn|undo|redo|return|corner|chevron|chevrons)\b/],
  ['communication', /\b(message|mail|phone|chat|megaphone|send|at-sign|inbox)\b/],
  ['devices', /\b(computer|monitor|laptop|smartphone|tablet|keyboard|mouse|cpu|server|printer)\b/],
  ['editing', /\b(pen|pencil|edit|scissors|brush|paint|ruler|crop|type|spell)\b/],
  ['files', /\b(file|folder|archive|clipboard|document|notebook|paper|receipt|book|copy)\b/],
  ['finance', /\b(dollar|euro|currency|credit|wallet|bank|coin|cash|receipt|percent)\b/],
  ['media', /\b(play|pause|video|music|audio|image|camera|film|volume|mic|speaker|radio)\b/],
  ['nature', /\b(leaf|tree|flower|sun|moon|cloud|wind|snow|rain|bird|fish|bug|mountain|waves)\b/],
  ['navigation', /\b(house|home|map|compass|navigation|map-pin|signpost|route|location|globe)\b/],
  ['shapes', /\b(circle|square|triangle|box|cube|hexagon|octagon|pentagon|shapes|diamond)\b/],
  ['status', /\b(check|x-|x$|info|warning|alert|badge|circle-check|circle-x|shield-check)\b/],
  ['time', /\b(clock|calendar|timer|hourglass|history|alarm|watch|sunrise|sunset)\b/],
  ['users', /\b(user|users|contact|person|people|id-card|access|fingerprint|handshake)\b/],
];

function category(name) {
  for (const [label, pattern] of categoryRules) if (pattern.test(name)) return label;
  return 'general';
}

function identifier(name) {
  const result = name.replace(/-([a-z0-9])/g, (_, character) => character.toUpperCase());
  return reservedWords.has(result) ? `${result}Icon` : result;
}

function tagsFor(name, aliases) {
  const words = new Set(name.split('-'));
  for (const alias of aliases ?? []) {
    if (typeof alias !== 'string') throw new Error(`Unsupported Lucide alias in ${name}.`);
    for (const word of alias.toLowerCase().split(/[^a-z0-9]+/)) if (word) words.add(word);
  }
  return [...words].sort();
}

function toDefinition(name, source) {
  if (!source || source.name !== name || !Number.isFinite(source.size) || source.size <= 0) {
    throw new Error(`Invalid Lucide icon metadata for ${name}.`);
  }
  if (!Array.isArray(source.node)) throw new Error(`Unsupported Lucide node list for ${name}.`);
  const nodes = source.node.map(([tag, input]) => {
    if (!allowedTags.has(tag)) throw new Error(`Unsupported SVG tag "${tag}" in ${name}.`);
    const attributes = {};
    for (const [key, value] of Object.entries(input)) {
      if (key === 'key') continue;
      if (!allowedAttributes.has(key)) {
        throw new Error(`Unsupported SVG attribute "${key}" in ${name}; refusing to omit it.`);
      }
      if (
        (typeof value !== 'string' && typeof value !== 'number') ||
        (typeof value === 'number' && !Number.isFinite(value))
      ) {
        throw new Error(`Unsupported value for SVG attribute "${key}" in ${name}.`);
      }
      attributes[key] = value;
    }
    return [tag, attributes];
  });
  return {
    name,
    viewBox: `0 0 ${source.size} ${source.size}`,
    nodes,
    category: category(name),
    tags: tagsFor(name, source.aliases),
  };
}

const oldCatalogPath = join(root, 'src', 'catalog.json');
await mkdir(join(root, 'src', 'lucide'), { recursive: true });
let previousNames = [];
try {
  previousNames = JSON.parse(await readFile(oldCatalogPath, 'utf8')).map(item => item.name);
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

const files = (await readdir(sourceDir)).filter(
  file => file.endsWith('.mjs') && file !== 'index.mjs'
);
files.sort((a, b) => a.localeCompare(b, 'en'));
const definitions = [];
for (const file of files) {
  const { default: source } = await import(pathToFileURL(join(sourceDir, file)).href);
  definitions.push(toDefinition(file.slice(0, -4), source));
}
if (definitions.length === 0) throw new Error('No Lucide icon modules found.');

const names = new Set();
for (const icon of definitions) {
  if (names.has(icon.name)) throw new Error(`Duplicate Lucide icon name: ${icon.name}`);
  names.add(icon.name);
}

const lucidePackage = JSON.parse(await readFile(join(sourceRoot, 'package.json'), 'utf8'));
const workspacePackage = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
if (workspacePackage.devDependencies?.['@lucide/icons'] !== lucidePackage.version) {
  throw new Error(
    `Pinned @lucide/icons ${workspacePackage.devDependencies?.['@lucide/icons']} does not match installed ${lucidePackage.version}.`
  );
}
const asLiteral = value => JSON.stringify(value);
for (const icon of definitions) {
  const identifierName = identifier(icon.name);
  const source = `import type { IconDefinition } from '../index.js';\n\nexport const ${identifierName} = ${JSON.stringify(
    { name: icon.name, viewBox: icon.viewBox, nodes: icon.nodes },
    null,
    2
  )} as const satisfies IconDefinition;\n`;
  await writeFile(join(root, 'src', 'lucide', `${icon.name}.ts`), source);
}
for (const stale of previousNames) {
  if (!names.has(stale)) await rm(join(root, 'src', 'lucide', `${stale}.ts`), { force: true });
}

const catalog = definitions.map(({ name, category: iconCategory, tags }) => ({
  name,
  category: iconCategory,
  tags,
}));
await writeFile(oldCatalogPath, `${JSON.stringify(catalog, null, 2)}\n`);
const catalogSource = `import type { IconCatalogItem } from './index.js';\n\nexport const lucideVersion = ${asLiteral(
  lucidePackage.version
)};\nexport const iconCatalog = ${JSON.stringify(catalog, null, 2)} as const satisfies readonly IconCatalogItem[];\n`;
await writeFile(join(root, 'src', 'catalog.ts'), catalogSource);
await writeFile(join(root, 'LICENSE-lucide'), await readFile(join(sourceRoot, 'LICENSE'), 'utf8'));

console.log(
  `Generated ${definitions.length} Lucide icon modules from @lucide/icons ${lucidePackage.version}.`
);
const biome = resolve(root, '..', '..', 'node_modules', '@biomejs', 'biome', 'bin', 'biome');
execFileSync(
  process.execPath,
  [biome, 'check', '--write', 'src/lucide', 'src/catalog.ts', 'src/catalog.json'],
  { cwd: root, stdio: 'inherit' }
);
