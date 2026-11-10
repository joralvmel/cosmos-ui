import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { checkManifest, checkPackFiles, listPackages, publishOrder } from '../release/packages.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const packages = listPackages(root);

describe('publishable packages', () => {
  it('all have a valid manifest', () => {
    expect(packages.flatMap(pkg => checkManifest(pkg, root))).toEqual([]);
  });

  it('are ordered after their internal dependencies', () => {
    const order = publishOrder(packages);
    expect(order).toHaveLength(packages.length);
    for (const { manifest } of packages) {
      const deps = Object.keys({ ...manifest.dependencies, ...manifest.peerDependencies });
      for (const dep of deps.filter(name => order.includes(name))) {
        expect(order.indexOf(dep), `${dep} before ${manifest.name}`).toBeLessThan(
          order.indexOf(manifest.name)
        );
      }
    }
  });

  it('detects dependency cycles', () => {
    const fake = (name, dep) => ({ dir: name, manifest: { name, dependencies: { [dep]: '*' } } });
    expect(() => publishOrder([fake('a', 'b'), fake('b', 'a')])).toThrow(/cycle/);
  });

  it('reports manifest problems', () => {
    const problems = checkManifest({ dir: 'packages/x', manifest: { name: 'x' } }, root);
    expect(problems.join('\n')).toMatch(/license must be MIT/);
    expect(problems.join('\n')).toMatch(/publishConfig.access/);
  });

  it('validates tarball contents', () => {
    const files = ['package.json', 'README.md', 'LICENSE', 'llms.md', 'dist/index.js'];
    expect(
      checkPackFiles(
        'pkg',
        files.map(path => ({ path }))
      )
    ).toEqual([]);
    const bad = checkPackFiles('pkg', [{ path: 'src/index.ts' }, { path: 'package.json' }]);
    expect(bad).toContain('pkg: tarball must not contain src/index.ts');
    expect(bad).toContain('pkg: tarball misses llms.md');
  });
});
