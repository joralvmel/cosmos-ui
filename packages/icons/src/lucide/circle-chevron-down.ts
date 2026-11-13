import type { IconDefinition } from '../index.js';

export const circleChevronDown = {
  name: 'circle-chevron-down',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'circle',
      {
        cx: '12',
        cy: '12',
        r: '10',
      },
    ],
    [
      'path',
      {
        d: 'm16 10-4 4-4-4',
      },
    ],
  ],
} as const satisfies IconDefinition;
