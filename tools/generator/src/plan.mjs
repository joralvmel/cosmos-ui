import * as chart from './templates/chart.mjs';
import * as component from './templates/component.mjs';
import * as theme from './templates/theme.mjs';

const key = n => (n.kebab.includes('-') ? `'${n.kebab}'` : n.kebab);
const catalogAnchor = /\];\n\n\/\*\* Catalog entry by name/;

/** Contract, scenarios, core exports, registry and catalog entry (when not planned yet). */
function coreOps(n, platforms) {
  return [
    {
      type: 'create',
      path: `packages/core/src/specs/${n.kebab}.ts`,
      content: component.contract(n, platforms),
    },
    {
      type: 'create',
      path: `packages/core/src/specs/${n.kebab}.scenarios.ts`,
      content: component.scenarios(n),
    },
    { type: 'append', path: 'packages/core/src/index.ts', content: component.coreExports(n) },
    {
      type: 'insert',
      path: 'packages/core/src/index.ts',
      before: /\n\} as const;/,
      content: `\n  ${key(n)}: ${n.camel}Contract,`,
    },
    {
      type: 'prepend',
      path: 'packages/core/src/index.ts',
      content: `import { ${n.camel}Contract } from './specs/${n.kebab}.js';\n`,
    },
    {
      type: 'insert',
      path: 'packages/core/src/catalog.ts',
      before: catalogAnchor,
      unless: new RegExp(`name: '${n.kebab}'`),
      content: component.catalogEntry(n, platforms),
    },
  ];
}

function nativeOps(n) {
  return [
    {
      type: 'create',
      path: `packages/native/src/components/${n.kebab}.tsx`,
      content: component.native(n),
    },
    { type: 'append', path: 'packages/native/src/index.ts', content: component.nativeExports(n) },
    {
      type: 'create',
      path: `packages/native/test/${n.kebab}.test.tsx`,
      content: component.nativeTest(n),
    },
    {
      type: 'create',
      path: `apps/native-demo/app/${n.kebab}.tsx`,
      content: component.nativeScreen(n),
    },
    {
      type: 'insert',
      path: 'apps/native-demo/src/screens.ts',
      before: /\] as const;\s*$/,
      content: component.nativeScreenEntry(n),
    },
  ];
}

function docsOps(n, web) {
  return [
    {
      type: 'create',
      path: `apps/docs/src/content/docs/components/${n.kebab}.mdx`,
      content: component.docsEn(n, web),
    },
    {
      type: 'create',
      path: `apps/docs/src/content/docs/es/components/${n.kebab}.mdx`,
      content: component.docsEs(n, web),
    },
  ];
}

/** Returns the list of file operations for a target, without touching the disk. */
export function plan(target, n, options = {}) {
  switch (target) {
    case 'component':
      return [
        ...coreOps(n),
        {
          type: 'create',
          path: `packages/elements/src/components/${n.kebab}/${n.tag}.ts`,
          content: component.element(n),
        },
        {
          type: 'append',
          path: 'packages/elements/src/index.ts',
          content: component.elementExports(n),
        },
        {
          type: 'json',
          path: 'packages/elements/package.json',
          update: pkg => addExport(pkg, `./${n.kebab}`, `./dist/components/${n.kebab}/${n.tag}`),
        },
        {
          type: 'create',
          path: `packages/elements/test/${n.kebab}.test.ts`,
          content: component.elementTest(n),
        },
        { type: 'append', path: 'packages/elements/llms.md', content: component.elementsLlms(n) },
        {
          type: 'create',
          path: `packages/react/src/components/${n.kebab}.ts`,
          content: component.react(n),
        },
        { type: 'append', path: 'packages/react/src/index.ts', content: component.reactExports(n) },
        {
          type: 'create',
          path: `packages/react/test/${n.kebab}.test.tsx`,
          content: component.reactTest(n),
        },
        {
          type: 'create',
          path: `packages/angular/src/components/${n.kebab}.component.ts`,
          content: component.angular(n),
        },
        {
          type: 'prepend',
          path: 'packages/angular/src/index.ts',
          content: `import { Cosm${n.pascal}Component } from './components/${n.kebab}.component.js';\n`,
        },
        {
          type: 'append',
          path: 'packages/angular/src/index.ts',
          content: `export { Cosm${n.pascal}Component } from './components/${n.kebab}.component.js';\n`,
        },
        {
          type: 'insert',
          path: 'packages/angular/src/index.ts',
          before: /\] as const;/,
          content: `, Cosm${n.pascal}Component`,
        },
        {
          type: 'create',
          path: `packages/angular/test/${n.kebab}.test.ts`,
          content: component.angularTest(n),
        },
        ...nativeOps(n),
        { type: 'append', path: 'packages/native/llms.md', content: component.nativeLlms(n) },
        ...docsOps(n, true),
        { type: 'create', path: `.changeset/add-${n.kebab}.md`, content: component.changeset(n) },
      ];
    case 'native':
      return [
        ...coreOps(n, ['native']),
        ...nativeOps(n),
        { type: 'append', path: 'packages/native/llms.md', content: component.nativeLlms(n) },
        ...docsOps(n, false),
        {
          type: 'create',
          path: `.changeset/add-${n.kebab}.md`,
          content: component.nativeOnlyChangeset(n),
        },
      ];
    case 'chart':
      return [
        {
          type: 'create',
          path: `packages/charts-core/src/${n.kebab}-layout.ts`,
          content: chart.layout(n),
        },
        {
          type: 'append',
          path: 'packages/charts-core/src/index.ts',
          content: chart.layoutExport(n),
        },
        {
          type: 'create',
          path: `packages/charts-core/test/${n.kebab}-layout.test.ts`,
          content: chart.layoutTest(n),
        },
        { type: 'create', path: `.changeset/add-${n.kebab}.md`, content: chart.changeset(n) },
      ];
    case 'theme':
      return [
        {
          type: 'insert',
          path: 'packages/tokens/src/themes.ts',
          before: /\n\/\*\* Built-in themes/,
          content: theme.definition(n, options.seed ?? 'oklch(0.58 0.15 200)'),
        },
        {
          type: 'insert',
          path: 'packages/tokens/src/themes.ts',
          before: /\];\nexport const defaultThemeName/,
          content: `, ${n.camel}`,
        },
        { type: 'create', path: `.changeset/add-${n.kebab}-theme.md`, content: theme.changeset(n) },
      ];
    default:
      throw new Error(`Unknown target "${target}". Use component, native, chart or theme.`);
  }
}

function addExport(pkg, subpath, base) {
  if (pkg.exports[subpath]) throw new Error(`Export "${subpath}" already exists`);
  const entries = Object.entries(pkg.exports);
  const index = entries.findIndex(([name]) => name === './custom-elements.json');
  entries.splice(index === -1 ? entries.length : index, 0, [
    subpath,
    { types: `${base}.d.ts`, default: `${base}.js` },
  ]);
  pkg.exports = Object.fromEntries(entries);
  return pkg;
}
