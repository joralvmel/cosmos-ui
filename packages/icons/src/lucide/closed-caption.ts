import type { IconDefinition } from '../index.js';

export const closedCaption = {
  name: 'closed-caption',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M10 9.17a3 3 0 1 0 0 5.66',
      },
    ],
    [
      'path',
      {
        d: 'M17 9.17a3 3 0 1 0 0 5.66',
      },
    ],
    [
      'rect',
      {
        x: '2',
        y: '5',
        width: '20',
        height: '14',
        rx: '2',
      },
    ],
  ],
} as const satisfies IconDefinition;
