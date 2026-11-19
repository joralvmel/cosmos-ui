import { defineContract } from '../contract.js';

/**
 * Static status or category label. Counts are ordinary caller-formatted text.
 */
export const badgeContract = defineContract({
  name: 'badge',
  tag: 'cosm-badge',
  description:
    'Displays a noninteractive status or category label, or caller-formatted count, with an optional decorative leading icon.',
  role: '',
  pattern: 'https://html.spec.whatwg.org/multipage/text-level-semantics.html',
  props: {
    variant: {
      type: 'enum',
      values: ['soft', 'solid', 'outline'],
      default: 'soft',
      reflect: true,
      description: 'Visual treatment of the static label.',
    },
    tone: {
      type: 'enum',
      values: ['neutral', 'info', 'success', 'warning', 'danger'],
      default: 'neutral',
      reflect: true,
      description: 'Semantic color intent of the static label.',
    },
    size: {
      type: 'enum',
      values: ['sm', 'md', 'lg'],
      default: 'md',
      reflect: true,
      description: 'Semantic label size.',
    },
    startIcon: {
      type: 'reference',
      reference: 'IconDefinition',
      options: ['search', 'house', 'heart', 'star'],
      example: 'heart',
      description: 'Optional structured decorative icon before the label.',
    },
  },
  events: {},
  states: [],
  slots: { '': 'Label or caller-formatted count text.' },
  parts: {
    base: 'Rounded label container.',
    label: 'Label or caller-formatted count text.',
    icon: 'Optional decorative leading icon wrapper.',
  },
  cssProperties: {
    '--cosm-badge-background': 'Badge background color.',
    '--cosm-badge-color': 'Badge text and icon color.',
    '--cosm-badge-border': 'Badge border color.',
    '--cosm-badge-padding-inline': 'Badge inline padding.',
    '--cosm-badge-padding-block': 'Badge block padding.',
    '--cosm-badge-gap': 'Space between the icon and label.',
    '--cosm-badge-font-family': 'Badge label font family.',
    '--cosm-badge-font-size': 'Badge label font size.',
    '--cosm-badge-font-weight': 'Badge label font weight.',
    '--cosm-badge-line-height': 'Badge label line height.',
    '--cosm-badge-radius': 'Badge corner radius.',
  },
  keyboard: [],
});
