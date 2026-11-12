import type { Platform } from './contract.js';

export type ComponentCategory =
  | 'action'
  | 'form'
  | 'overlay'
  | 'navigation'
  | 'data-display'
  | 'feedback'
  | 'layout'
  | 'primitive'
  | 'mobile';

/**
 * - `planned`: nothing exists yet.
 * - `in-progress`: some pieces exist (contract, a platform, docs…).
 * - `stable`: every piece exists for every platform of the entry.
 */
export type ComponentStatus = 'planned' | 'in-progress' | 'stable';

export interface CatalogEntry {
  /** kebab-case name; the web tag is `cosm-<name>`. */
  name: string;
  title: string;
  category: ComponentCategory;
  /** Roadmap batch (A primitives … E data, `mobile` for native-only components). */
  batch: 'A' | 'B' | 'C' | 'D' | 'E' | 'mobile' | 'internal';
  /** 1 = minimum base of the library, 2 = next, 3 = later. */
  priority: 1 | 2 | 3;
  /** Components that must exist before this one (used inside it). */
  dependsOn: readonly string[];
  /** Accessibility reference: WAI-ARIA APG pattern or HTML specification. */
  pattern: string;
  platforms: readonly Platform[];
  /** Status the component should reach in the current milestone. */
  target: ComponentStatus;
  /**
   * Status claimed by maintainers. Only `stable` is ever written here, and only when the status
   * report confirms every piece exists (a test enforces it).
   */
  status?: 'stable';
  /** Traceable TODO notes (e.g. "uses a native <select> until listbox exists"). Never in code. */
  notes?: readonly string[];
}

const all: readonly Platform[] = ['web', 'react', 'angular', 'native'];
const nativeOnly: readonly Platform[] = ['native'];
const apg = (pattern: string) => `https://www.w3.org/WAI/ARIA/apg/patterns/${pattern}/`;
const html = (element: string) => `https://html.spec.whatwg.org/multipage/${element}`;

type Entry = Omit<CatalogEntry, 'platforms' | 'target'> &
  Partial<Pick<CatalogEntry, 'platforms' | 'target'>>;

const entry = (data: Entry): CatalogEntry => ({
  platforms: all,
  target: data.priority === 1 ? 'stable' : 'planned',
  ...data,
});

/** Canonical list of planned components. Order: batch, then priority. */
export const catalog: readonly CatalogEntry[] = [
  // Batch A: primitives
  entry({
    name: 'button',
    title: 'Button',
    category: 'action',
    batch: 'A',
    priority: 1,
    dependsOn: [],
    pattern: apg('button'),
    status: 'stable',
  }),
  entry({
    name: 'icon',
    title: 'Icon',
    category: 'data-display',
    batch: 'A',
    priority: 1,
    dependsOn: [],
    pattern: 'https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA24',
    status: 'stable',
  }),
  entry({
    name: 'icon-button',
    title: 'Icon button',
    category: 'action',
    batch: 'A',
    priority: 2,
    dependsOn: ['button', 'icon'],
    pattern: apg('button'),
  }),
  entry({
    name: 'badge',
    title: 'Badge',
    category: 'data-display',
    batch: 'A',
    priority: 1,
    dependsOn: [],
    pattern: html('text-level-semantics.html'),
  }),
  entry({
    name: 'spinner',
    title: 'Spinner',
    category: 'feedback',
    batch: 'A',
    priority: 2,
    dependsOn: [],
    pattern: apg('meter'),
  }),
  entry({
    name: 'avatar',
    title: 'Avatar',
    category: 'data-display',
    batch: 'A',
    priority: 1,
    dependsOn: [],
    pattern: html('embedded-content.html'),
  }),
  entry({
    name: 'divider',
    title: 'Divider',
    category: 'layout',
    batch: 'A',
    priority: 1,
    dependsOn: [],
    pattern: 'https://www.w3.org/TR/wai-aria-1.2/#separator',
  }),
  // Internal primitives used by several components
  entry({
    name: 'listbox',
    title: 'Listbox',
    category: 'primitive',
    batch: 'internal',
    priority: 1,
    dependsOn: [],
    pattern: apg('listbox'),
  }),
  entry({
    name: 'calendar',
    title: 'Calendar',
    category: 'primitive',
    batch: 'internal',
    priority: 1,
    dependsOn: ['button'],
    pattern: apg('dialog-modal/examples/datepicker-dialog'),
  }),
  // Batch B: forms
  entry({
    name: 'text-field',
    title: 'Text field',
    category: 'form',
    batch: 'B',
    priority: 1,
    dependsOn: ['icon'],
    pattern: html('input.html'),
  }),
  entry({
    name: 'textarea',
    title: 'Textarea',
    category: 'form',
    batch: 'B',
    priority: 1,
    dependsOn: [],
    pattern: html('form-elements.html#the-textarea-element'),
  }),
  entry({
    name: 'checkbox',
    title: 'Checkbox',
    category: 'form',
    batch: 'B',
    priority: 1,
    dependsOn: ['icon'],
    pattern: apg('checkbox'),
  }),
  entry({
    name: 'radio-group',
    title: 'Radio group',
    category: 'form',
    batch: 'B',
    priority: 1,
    dependsOn: [],
    pattern: apg('radio'),
  }),
  entry({
    name: 'switch',
    title: 'Switch',
    category: 'form',
    batch: 'B',
    priority: 1,
    dependsOn: [],
    pattern: apg('switch'),
  }),
  entry({
    name: 'number-field',
    title: 'Number field',
    category: 'form',
    batch: 'B',
    priority: 2,
    dependsOn: ['text-field', 'icon-button'],
    pattern: apg('spinbutton'),
  }),
  entry({
    name: 'select',
    title: 'Select',
    category: 'form',
    batch: 'B',
    priority: 1,
    dependsOn: ['popover', 'listbox', 'icon'],
    pattern: apg('combobox/examples/combobox-select-only'),
  }),
  entry({
    name: 'combobox',
    title: 'Combobox',
    category: 'form',
    batch: 'B',
    priority: 1,
    dependsOn: ['popover', 'listbox', 'text-field'],
    pattern: apg('combobox'),
  }),
  entry({
    name: 'multi-select',
    title: 'Multi-select',
    category: 'form',
    batch: 'B',
    priority: 1,
    dependsOn: ['popover', 'listbox', 'badge', 'checkbox'],
    pattern: apg('listbox'),
  }),
  entry({
    name: 'slider',
    title: 'Slider',
    category: 'form',
    batch: 'B',
    priority: 2,
    dependsOn: [],
    pattern: apg('slider'),
  }),
  // Batch C: overlays
  entry({
    name: 'popover',
    title: 'Popover',
    category: 'overlay',
    batch: 'C',
    priority: 1,
    dependsOn: [],
    pattern: 'https://open-ui.org/components/popover.research.explainer/',
  }),
  entry({
    name: 'tooltip',
    title: 'Tooltip',
    category: 'overlay',
    batch: 'C',
    priority: 1,
    dependsOn: ['popover'],
    pattern: apg('tooltip'),
  }),
  entry({
    name: 'dialog',
    title: 'Dialog',
    category: 'overlay',
    batch: 'C',
    priority: 1,
    dependsOn: ['button', 'icon-button'],
    pattern: apg('dialog-modal'),
  }),
  entry({
    name: 'drawer',
    title: 'Drawer',
    category: 'overlay',
    batch: 'C',
    priority: 2,
    dependsOn: ['dialog'],
    pattern: apg('dialog-modal'),
  }),
  entry({
    name: 'toast',
    title: 'Toast',
    category: 'feedback',
    batch: 'C',
    priority: 1,
    dependsOn: ['icon', 'icon-button'],
    pattern: apg('alert'),
  }),
  entry({
    name: 'menu',
    title: 'Menu',
    category: 'overlay',
    batch: 'C',
    priority: 2,
    dependsOn: ['popover'],
    pattern: apg('menu-button'),
  }),
  entry({
    name: 'split-button',
    title: 'Split button',
    category: 'action',
    batch: 'C',
    priority: 3,
    dependsOn: ['button', 'menu'],
    pattern: apg('menu-button'),
  }),
  // Batch D: navigation and structure
  entry({
    name: 'tabs',
    title: 'Tabs',
    category: 'navigation',
    batch: 'D',
    priority: 1,
    dependsOn: [],
    pattern: apg('tabs'),
  }),
  entry({
    name: 'accordion',
    title: 'Accordion',
    category: 'navigation',
    batch: 'D',
    priority: 1,
    dependsOn: ['icon'],
    pattern: apg('accordion'),
  }),
  entry({
    name: 'pagination',
    title: 'Pagination',
    category: 'navigation',
    batch: 'D',
    priority: 1,
    dependsOn: ['button', 'icon-button'],
    pattern: 'https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/',
  }),
  entry({
    name: 'steps',
    title: 'Steps',
    category: 'navigation',
    batch: 'D',
    priority: 2,
    dependsOn: ['icon'],
    pattern: 'https://www.w3.org/WAI/tutorials/forms/multi-page/',
  }),
  entry({
    name: 'breadcrumb',
    title: 'Breadcrumb',
    category: 'navigation',
    batch: 'D',
    priority: 2,
    dependsOn: ['icon'],
    pattern: apg('breadcrumb'),
  }),
  entry({
    name: 'card',
    title: 'Card',
    category: 'layout',
    batch: 'D',
    priority: 1,
    dependsOn: [],
    pattern: html('sections.html#the-article-element'),
  }),
  // Batch E: data
  entry({
    name: 'table',
    title: 'Table',
    category: 'data-display',
    batch: 'E',
    priority: 1,
    dependsOn: ['checkbox', 'pagination', 'icon-button'],
    pattern: apg('table'),
  }),
  entry({
    name: 'date-picker',
    title: 'Date picker',
    category: 'form',
    batch: 'E',
    priority: 1,
    dependsOn: ['popover', 'calendar', 'text-field'],
    pattern: apg('dialog-modal/examples/datepicker-dialog'),
  }),
  entry({
    name: 'date-range-picker',
    title: 'Date range picker',
    category: 'form',
    batch: 'E',
    priority: 3,
    dependsOn: ['date-picker'],
    pattern: apg('dialog-modal/examples/datepicker-dialog'),
  }),
  // Mobile-only components
  entry({
    name: 'bottom-sheet',
    title: 'Bottom sheet',
    category: 'mobile',
    batch: 'mobile',
    priority: 3,
    dependsOn: [],
    pattern: apg('dialog-modal'),
    platforms: nativeOnly,
  }),
  entry({
    name: 'skeleton',
    title: 'Skeleton',
    category: 'mobile',
    batch: 'mobile',
    priority: 3,
    dependsOn: [],
    pattern: 'https://www.w3.org/TR/wai-aria-1.2/#aria-busy',
    platforms: nativeOnly,
  }),
  entry({
    name: 'list-item',
    title: 'List item',
    category: 'mobile',
    batch: 'mobile',
    priority: 3,
    dependsOn: ['icon'],
    pattern: apg('listbox'),
    platforms: nativeOnly,
  }),
];

/** Catalog entry by name, or `undefined`. */
export function catalogEntry(name: string): CatalogEntry | undefined {
  return catalog.find(item => item.name === name);
}

/**
 * Build order respecting dependencies (dependencies first). Throws on unknown dependencies or cycles,
 * so a broken catalog fails its tests.
 */
export function buildOrder(entries: readonly CatalogEntry[] = catalog): string[] {
  const byName = new Map(entries.map(item => [item.name, item]));
  const order: string[] = [];
  const state = new Map<string, 'visiting' | 'done'>();
  const visit = (name: string, trail: string[]) => {
    const item = byName.get(name);
    if (!item) throw new Error(`Unknown dependency "${name}" (from ${trail.join(' → ')})`);
    if (state.get(name) === 'done') return;
    if (state.get(name) === 'visiting') throw new Error(`Cycle: ${[...trail, name].join(' → ')}`);
    state.set(name, 'visiting');
    for (const dep of item.dependsOn) visit(dep, [...trail, name]);
    state.set(name, 'done');
    order.push(name);
  };
  for (const item of entries) visit(item.name, []);
  return order;
}
