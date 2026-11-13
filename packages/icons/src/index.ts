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
const attributes = new Set<string>([
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

export interface IconCatalogItem {
  name: string;
  category: string;
  tags: readonly string[];
}

export { iconCatalog, lucideVersion } from './catalog.js';

/** Search metadata without loading artwork; exact names precede prefixes and other matches. */
export function searchIconCatalog(
  items: readonly IconCatalogItem[],
  query: string
): IconCatalogItem[] {
  const term = query.trim().toLowerCase();
  const rank = (name: string) =>
    term && name.toLowerCase() === term ? 0 : term && name.toLowerCase().startsWith(term) ? 1 : 2;
  return items
    .filter(item =>
      `${item.name} ${item.category} ${item.tags.join(' ')}`.toLowerCase().includes(term)
    )
    .sort((a, b) => rank(a.name) - rank(b.name));
}

/** Validates untrusted icon data (e.g. loaded from JSON) before rendering it. */
export function isIconDefinition(value: unknown): value is IconDefinition {
  if (typeof value !== 'object' || value === null) return false;
  const icon = value as Partial<IconDefinition>;
  if (typeof icon.name !== 'string' || !/^[a-z0-9-]+$/.test(icon.name)) return false;
  if (typeof icon.viewBox !== 'string' || !/^[\d.\s-]+$/.test(icon.viewBox)) return false;
  const viewBox = icon.viewBox.trim().split(/\s+/).map(Number);
  const width = viewBox.at(2);
  const height = viewBox.at(3);
  if (
    viewBox.length !== 4 ||
    !viewBox.every(Number.isFinite) ||
    width === undefined ||
    height === undefined ||
    width <= 0 ||
    height <= 0
  ) {
    return false;
  }
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
          attributes.has(key) &&
          ((typeof val === 'number' && Number.isFinite(val)) ||
            (typeof val === 'string' &&
              !/url\s*\(|javascript:/i.test(val) &&
              (key !== 'fill' ||
                (!val.includes('\\') &&
                  ![...val].some(character => character.charCodeAt(0) < 32)))))
      )
  );
}
