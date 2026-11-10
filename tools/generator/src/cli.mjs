#!/usr/bin/env node
// Usage: npm run generate -- <component|native|chart|theme> <kebab-name> [--dry-run] [--seed <color>]
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { apply } from './apply.mjs';
import { names } from './names.mjs';
import { plan } from './plan.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    'dry-run': { type: 'boolean', default: false },
    seed: { type: 'string' },
    help: { type: 'boolean', short: 'h', default: false },
  },
});

const [target, name] = positionals;
if (values.help || !target || !name) {
  console.log(`Usage: npm run generate -- <target> <kebab-name> [--dry-run] [--seed <color>]

Targets:
  component  Contract + scenarios, Web Component, React, Angular, React Native, docs (EN/ES), changeset
  native     Native-only component: contract + scenarios, React Native, demo screen, changeset
  chart      Pure chart layout in charts-core with tests and changeset
  theme      Theme definition in tokens (light + dark) and changeset; --seed sets the primary color`);
  process.exit(values.help ? 0 : 1);
}

try {
  const n = names(name);
  const files = apply(root, plan(target, n, { seed: values.seed }), { dryRun: values['dry-run'] });
  console.log(`${values['dry-run'] ? 'Would write' : 'Wrote'} ${files.length} files:`);
  for (const file of files) console.log(`  ${file}`);
  if (!values['dry-run']) {
    const biome = createRequire(`${root}package.json`).resolve('@biomejs/biome/bin/biome');
    const result = spawnSync(process.execPath, [biome, 'check', '--write', ...files], {
      cwd: root,
      stdio: 'inherit',
    });
    if (result.status !== 0) console.warn('Biome reported issues; run `npm run lint:fix`.');
    console.log('\nNext: resolve every TODO(generator) marker, then run');
    console.log('  npx biome ci . && npx turbo run typecheck test build');
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
