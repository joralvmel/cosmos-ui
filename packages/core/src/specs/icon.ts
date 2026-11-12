import { defineContract } from '../contract.js';

/** A non-interactive vector icon with decorative or informative semantics. */
export const iconContract = defineContract({
  name: 'icon',
  tag: 'cosm-icon',
  description:
    'Renders a structured SVG icon. Decorative icons are hidden from assistive technology; informative icons require a text label.',
  role: 'img',
  pattern: 'https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA24',
  props: {
    icon: {
      type: 'reference',
      reference: 'IconDefinition',
      required: true,
      options: ['house', 'heart', 'search', 'star'],
      example: 'house',
      description: 'Structured icon definition, commonly imported from @joralvmel/cosmos-icons.',
    },
    size: {
      type: 'union',
      variants: [{ type: 'enum', values: ['sm', 'md', 'lg'] }, { type: 'number' }],
      default: 'md',
      reflect: true,
      description:
        'Semantic size (16, 20 or 24) or a positive finite number in pixels / native units.',
    },
    stroke: {
      type: 'string',
      default: 'currentColor',
      description:
        'Stroke paint; currentColor inherits on web and resolves to the theme foreground on native.',
    },
    fill: {
      type: 'string',
      default: 'none',
      description: 'Root fill paint. Explicit node fills take precedence.',
    },
    strokeWidth: {
      type: 'number',
      default: 2,
      description: 'Finite nonnegative stroke width in SVG viewBox units.',
    },
    label: {
      type: 'string',
      description: 'Accessible name required when decorative is false.',
    },
    decorative: {
      type: 'boolean',
      default: true,
      reflect: true,
      description: 'Hides the icon from assistive technology when true.',
    },
  },
  events: {},
  states: [],
  slots: {},
  parts: { icon: 'Rendered SVG image.' },
  cssProperties: { '--cosm-icon-size': 'Override the rendered icon width and height.' },
  keyboard: [],
});
