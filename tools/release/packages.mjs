#!/usr/bin/env node
// Publishable package helpers.
//
//   node tools/release/packages.mjs --order   publish order (dependencies first), for the first
//                                             manual publication
//   node tools/release/packages.mjs --check   validates every manifest and runs `npm pack --dry-run`
//                                             (packages must be built first)
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPOSITORY = 'git+https://github.com/joralvmel/cosmos-ui.git';

export function listPackages(root) {
  const dir = join(root, 'packages');
  return readdirSync(dir, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && existsSync(join(dir, entry.name, 'package.json')))
    .map(entry => ({
      dir: `packages/${entry.name}`,
      manifest: JSON.parse(readFileSync(join(dir, entry.name, 'package.json'), 'utf8')),
    }))
    .filter(pkg => !pkg.manifest.private);
}

/** Topological order: every package comes after the internal packages it depends on. */
export function publishOrder(packages) {
  const names = new Set(packages.map(pkg => pkg.manifest.name));
  const byName = new Map(packages.map(pkg => [pkg.manifest.name, pkg]));
  const order = [];
  const state = new Map();
  const visit = (name, trail) => {
    if (state.get(name) === 'done') return;
    if (state.get(name) === 'visiting') {
      throw new Error(`Dependency cycle: ${[...trail, name].join(' → ')}`);
    }
    state.set(name, 'visiting');
    const { manifest } = byName.get(name);
    const deps = Object.keys({ ...manifest.dependencies, ...manifest.peerDependencies })
      .filter(dep => names.has(dep))
      .sort();
    for (const dep of deps) visit(dep, [...trail, name]);
    state.set(name, 'done');
    order.push(name);
  };
  for (const name of [...names].sort()) visit(name, []);
  return order;
}

/** Manifest rules for publishable packages. Returns a list of problems. */
export function checkManifest({ dir, manifest }, root) {
  const problems = [];
  const add = message => problems.push(`${manifest.name ?? dir}: ${message}`);
  if (!/^@joralvmel\/cosmos-[a-z0-9-]+$/.test(manifest.name ?? '')) {
    add('name must be @joralvmel/cosmos-*');
  }
  if (manifest.license !== 'MIT') add('license must be MIT');
  if (manifest.publishConfig?.access !== 'public') add('publishConfig.access must be "public"');
  if (manifest.repository?.url !== REPOSITORY) add(`repository.url must be ${REPOSITORY}`);
  if (manifest.repository?.directory !== dir) add(`repository.directory must be ${dir}`);
  for (const file of ['dist', 'llms.md']) {
    if (!manifest.files?.includes(file)) add(`files must include "${file}"`);
  }
  if (!manifest.exports?.['./package.json']) add('exports must include "./package.json"');
  if (!manifest.exports?.['./llms.md']) add('exports must include "./llms.md"');
  if (!manifest.exports?.['.']) add('exports must include "."');
  if (manifest.version === undefined) add('version is required');
  for (const file of ['README.md', 'LICENSE', 'llms.md']) {
    if (!existsSync(join(root, dir, file))) add(`${file} is missing`);
  }
  return problems;
}

/** Checks the file list of `npm pack --dry-run --json`. */
export function checkPackFiles(name, files) {
  const problems = [];
  const paths = files.map(file => file.path);
  for (const required of ['package.json', 'README.md', 'LICENSE', 'llms.md']) {
    if (!paths.includes(required)) problems.push(`${name}: tarball misses ${required}`);
  }
  if (!paths.some(path => path.startsWith('dist/'))) {
    problems.push(`${name}: tarball has no dist/ files`);
  }
  for (const path of paths) {
    if (/^(src|test|scripts)\//.test(path) || /\.test\.[cm]?[jt]sx?$/.test(path)) {
      problems.push(`${name}: tarball must not contain ${path}`);
    }
  }
  return problems;
}

function main() {
  const root = fileURLToPath(new URL('../../', import.meta.url));
  const packages = listPackages(root);
  if (process.argv.includes('--order')) {
    for (const [index, name] of publishOrder(packages).entries())
      console.log(`${index + 1}. ${name}`);
    return;
  }
  if (!process.argv.includes('--check')) {
    console.log('Usage: node tools/release/packages.mjs --order | --check');
    process.exitCode = 1;
    return;
  }
  const problems = packages.flatMap(pkg => checkManifest(pkg, root));
  for (const pkg of packages) {
    const output = execFileSync('npm pack --dry-run --json --ignore-scripts', {
      cwd: join(root, pkg.dir),
      encoding: 'utf8',
      shell: true,
    });
    const [result] = JSON.parse(output);
    problems.push(...checkPackFiles(pkg.manifest.name, result.files));
    console.log(
      `${pkg.manifest.name}: ${result.files.length} files, ${Math.round(result.size / 1024)} kB`
    );
  }
  if (problems.length > 0) {
    console.error(`\n${problems.length} problem(s):`);
    for (const problem of problems) console.error(`  - ${problem}`);
    process.exitCode = 1;
    return;
  }
  console.log(`\n${packages.length} packages ready to publish.`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
