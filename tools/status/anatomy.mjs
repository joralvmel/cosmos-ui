// Checks that a component follows docs/conventions/component-anatomy.md. Used by
// tools/test/structure.test.mjs (implemented components) and the generator tests (templates).
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { piecePaths } from './component-status.mjs';

export function namesOf(kebab) {
  const pascal = kebab
    .split('-')
    .map(word => word[0].toUpperCase() + word.slice(1))
    .join('');
  return { kebab, pascal, camel: pascal[0].toLowerCase() + pascal.slice(1), tag: `cosm-${kebab}` };
}

const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Every marker must exist and appear after the previous one. Optional markers (`optional: true`)
 * are skipped when missing.
 */
export function checkOrder(file, text, markers) {
  const problems = [];
  let last = -1;
  let lastLabel = 'start of file';
  for (const { label, pattern, optional } of markers) {
    const match = pattern.exec(text);
    if (!match) {
      if (!optional) problems.push(`${file}: missing ${label}`);
      continue;
    }
    if (match.index < last) problems.push(`${file}: ${label} must come after ${lastLabel}`);
    last = match.index;
    lastLabel = label;
  }
  return problems;
}

const lastImportEnd = text => {
  const matches = [...text.matchAll(/^import [\s\S]*?;$/gm)];
  const last = matches.at(-1);
  return last ? last.index + last[0].length : 0;
};

function webMarkers(n) {
  return [
    { label: 'styles (const styles = css`)', pattern: /^const styles = css`/m },
    {
      label: `class Cosm${n.pascal}`,
      pattern: new RegExp(`^export class Cosm${n.pascal} extends CosmElement`, 'm'),
    },
    { label: 'static properties', pattern: /^ {2}static override properties = \{/m },
    {
      label: 'static styles (…styles)',
      pattern: /^ {2}static override styles = (?:styles|\[[\w, ]*\bstyles\]);/m,
    },
    { label: 'constructor', pattern: /^ {2}constructor\(\) \{/m },
    { label: 'render()', pattern: /^ {2}protected override render\(\)/m },
    {
      label: `define('${n.tag}')`,
      pattern: new RegExp(`^define\\('${n.tag}', Cosm${n.pascal}\\);`, 'm'),
    },
    { label: 'declare global', pattern: /^declare global \{/m },
  ];
}

/** Class body: private handlers before render(), render() last. */
function checkClassBody(file, text) {
  const problems = [];
  const render = text.search(/^ {2}protected override render\(\)/m);
  if (render === -1) return problems;
  const classEnd = render + text.slice(render).search(/^\}$/m);
  for (const handler of text.matchAll(/^ {2}#on\w+ = /gm)) {
    if (handler.index > render)
      problems.push(`${file}: private handlers must come before render()`);
  }
  const membersAfterRender = text
    .slice(render, classEnd)
    .split('\n')
    .slice(1)
    .filter(line => /^ {2}\S/.test(line) && line.trim() !== '}');
  if (membersAfterRender.length > 0)
    problems.push(`${file}: render() must be the last class member`);
  if (text.search(/^const styles = css`/m) < lastImportEnd(text)) {
    problems.push(`${file}: styles must come after the imports`);
  }
  return problems;
}

function checkJsDocTags(file, text, className) {
  const classIndex = text.search(new RegExp(`^export class ${className}`, 'm'));
  const doc = text.slice(0, classIndex).match(/\/\*\*[\s\S]*?\*\/\s*$/)?.[0] ?? '';
  if (!doc) return [`${file}: JSDoc missing on ${className}`];
  const order = ['@tag', '@slot', '@csspart', '@fires', '@cssprop'];
  const problems = [];
  if (!doc.includes('@tag')) problems.push(`${file}: JSDoc must include @tag`);
  let last = -1;
  for (const tag of order) {
    const index = doc.indexOf(` ${tag} `);
    if (index === -1) continue;
    if (index < last) problems.push(`${file}: JSDoc ${tag} is out of order (${order.join(', ')})`);
    last = Math.max(last, doc.lastIndexOf(` ${tag} `));
  }
  return problems;
}

const describeBlock = title => ({
  label: `describe('${title}')`,
  pattern: new RegExp(`describe\\('${escapeRegExp(title)}'`),
});

/** Problems of one component; `platforms` comes from the catalog entry. */
export function checkAnatomy(root, kebab, platforms) {
  const n = namesOf(kebab);
  const paths = piecePaths(kebab);
  const web = platforms.includes('web');
  const native = platforms.includes('native');
  const problems = [];
  const read = path => {
    const full = join(root, path);
    if (!existsSync(full)) {
      problems.push(`${path}: missing file`);
      return undefined;
    }
    return readFileSync(full, 'utf8');
  };
  const check = (path, fn) => {
    const text = read(path);
    if (text !== undefined) problems.push(...fn(path, text));
  };

  check(paths.contract, (file, text) =>
    checkOrder(file, text, [
      {
        label: `export const ${n.camel}Contract = defineContract(`,
        pattern: new RegExp(`^export const ${n.camel}Contract = defineContract\\(\\{`, 'm'),
      },
      ...[
        'name',
        'tag',
        'description',
        'platforms',
        'role',
        'pattern',
        'props',
        'events',
        'states',
        'slots',
        'parts',
        'cssProperties',
        'keyboard',
      ].map(key => ({
        label: `key ${key}`,
        pattern: new RegExp(`^ {2}${key}:`, 'm'),
        optional: key === 'platforms',
      })),
    ])
  );
  check(paths.scenarios, (file, text) =>
    checkOrder(file, text, [
      {
        label: `export const ${n.camel}Scenarios`,
        pattern: new RegExp(`^export const ${n.camel}Scenarios\\b`, 'm'),
      },
      {
        label: `export const ${n.camel}ScenariosFor`,
        pattern: new RegExp(`^export const ${n.camel}ScenariosFor\\b`, 'm'),
      },
    ])
  );

  if (web) {
    check(paths.web, (file, text) => [
      ...checkOrder(file, text, webMarkers(n)),
      ...checkClassBody(file, text),
      ...checkJsDocTags(file, text, `Cosm${n.pascal}`),
    ]);
    check(paths.react, (file, text) =>
      checkOrder(file, text, [
        {
          label: `export const ${n.camel}Events`,
          pattern: new RegExp(`^export const ${n.camel}Events = \\{`, 'm'),
        },
        {
          label: `export const ${n.pascal} = createComponent`,
          pattern: new RegExp(`^export const ${n.pascal} = createComponent\\(`, 'm'),
        },
        {
          label: `export type ${n.pascal}Props`,
          pattern: new RegExp(`^export type ${n.pascal}Props = `, 'm'),
        },
      ])
    );
    check(paths.angular, (file, text) =>
      checkOrder(file, text, [
        { label: '@Component', pattern: /^@Component\(\{/m },
        { label: `selector '${n.tag}'`, pattern: new RegExp(`selector: '${n.tag}'`) },
        {
          label: `class Cosm${n.pascal}Component`,
          pattern: new RegExp(`^export class Cosm${n.pascal}Component \\{`, 'm'),
        },
        { label: 'readonly element', pattern: /^ {2}readonly element: /m },
        { label: '@Input()', pattern: /^ {2}@Input\(/m, optional: true },
        { label: '@Output()', pattern: /^ {2}@Output\(/m, optional: true },
      ])
    );
    check(paths.testsWeb, (file, text) =>
      checkOrder(file, text, [
        describeBlock(`${n.tag}: shared scenarios`),
        describeBlock(`${n.tag}: contract drift`),
      ])
    );
    check(paths.testsReact, (file, text) =>
      checkOrder(file, text, [
        describeBlock(`${n.pascal}: shared scenarios`),
        describeBlock(`${n.pascal}: contract drift`),
      ])
    );
    check(paths.testsAngular, (file, text) =>
      checkOrder(file, text, [
        describeBlock(`Cosm${n.pascal}Component`),
        describeBlock(`Cosm${n.pascal}Component: contract drift`),
      ])
    );
  }

  if (native) {
    check(paths.native, (file, text) =>
      checkOrder(file, text, [
        {
          label: `export interface ${n.pascal}Props`,
          pattern: new RegExp(`^export interface ${n.pascal}Props\\b`, 'm'),
        },
        {
          label: `export const ${n.camel}PropNames`,
          pattern: new RegExp(`^export const ${n.camel}PropNames = `, 'm'),
        },
        {
          label: `export function ${n.pascal}`,
          pattern: new RegExp(`^export function ${n.pascal}\\(`, 'm'),
        },
      ])
    );
    check(paths.testsNative, (file, text) =>
      checkOrder(file, text, [
        describeBlock(`${n.pascal} (native): shared scenarios`),
        describeBlock(`${n.pascal} (native): contract drift`),
      ])
    );
    read(paths.nativeDemo);
  }

  const docs = [
    [
      paths.docsEn,
      ['Playground', 'Variants', 'States', 'Accessibility', 'API', 'Events by platform'],
    ],
    [
      paths.docsEs,
      ['Playground', 'Variantes', 'Estados', 'Accesibilidad', 'API', 'Eventos por plataforma'],
    ],
  ];
  for (const [path, headings] of docs) {
    check(path, (file, text) => {
      const headingMarkers = headings.map(heading => ({
        label: `## ${heading}`,
        pattern: new RegExp(`^## ${escapeRegExp(heading)}$`, 'm'),
      }));
      const [playground, variants, states, accessibility, api, events] = headingMarkers;
      return checkOrder(file, text, [
        { label: '<StatusBadge>', pattern: new RegExp(`<StatusBadge name="${kebab}" />`) },
        playground,
        ...(web
          ? [{ label: '<Playground>', pattern: new RegExp(`<Playground name="${kebab}"`) }]
          : []),
        variants,
        states,
        accessibility,
        api,
        { label: '<ApiTable>', pattern: new RegExp(`<ApiTable name="${kebab}" />`) },
        events,
        { label: '<EventsTable>', pattern: new RegExp(`<EventsTable name="${kebab}" />`) },
      ]);
    });
  }
  return problems;
}
