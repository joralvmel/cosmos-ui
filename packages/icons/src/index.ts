/** SVG element allowed in an icon definition. */
export type IconNodeTag = 'path' | 'circle' | 'ellipse' | 'line' | 'polyline' | 'polygon' | 'rect';

/** One SVG child: tag and attributes (no event handlers, no raw markup). */
export type IconNode = readonly [IconNodeTag, Readonly<Record<string, string | number>>];

/**
 * Framework-neutral icon. Renderers (web, React, Angular, React Native) build elements from
 * this structure, so icons never require rendering HTML strings.
 */
export interface IconDefinition {
  name: string;
  viewBox: string;
  nodes: readonly IconNode[];
}

const tags = new Set<string>(['path', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'rect']);
const attribute = /^[a-z][a-z-]*$/;

/** Validates untrusted icon data (e.g. loaded from JSON) before rendering it. */
export function isIconDefinition(value: unknown): value is IconDefinition {
  if (typeof value !== 'object' || value === null) return false;
  const icon = value as Partial<IconDefinition>;
  if (typeof icon.name !== 'string' || !/^[a-z0-9-]+$/.test(icon.name)) return false;
  if (typeof icon.viewBox !== 'string' || !/^[\d.\s-]+$/.test(icon.viewBox)) return false;
  if (!Array.isArray(icon.nodes)) return false;
  return icon.nodes.every(
    node =>
      Array.isArray(node) &&
      node.length === 2 &&
      tags.has(node[0]) &&
      typeof node[1] === 'object' &&
      node[1] !== null &&
      Object.entries(node[1]).every(
        ([key, val]) =>
          attribute.test(key) &&
          !key.startsWith('on') &&
          (typeof val === 'number' ||
            (typeof val === 'string' && !/url\s*\(|javascript:/i.test(val)))
      )
  );
}
