import type { IconDefinition } from '../index.js';

export const squareChevronDown = {
  name: 'square-chevron-down',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'rect',
      {
        width: '18',
        height: '18',
        x: '3',
        y: '3',
        rx: '2',
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
