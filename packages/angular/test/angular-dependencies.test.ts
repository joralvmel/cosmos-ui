import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { expect, it } from 'vitest';

it('resolves all Angular development packages to the same version', () => {
  const manifestPath = join(process.cwd(), 'package.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
    devDependencies: Record<string, string>;
  };
  const require = createRequire(manifestPath);
  const versions = Object.keys(manifest.devDependencies)
    .filter(name => name.startsWith('@angular/'))
    .map(name => {
      const path = require.resolve(`${name}/package.json`);
      const pkg = JSON.parse(readFileSync(path, 'utf8')) as { version: string };
      return pkg.version;
    });

  expect(new Set(versions).size).toBe(1);
});
