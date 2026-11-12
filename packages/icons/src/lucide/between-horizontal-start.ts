import type { IconDefinition } from '../index.js';

export const betweenHorizontalStart = {
  name: 'between-horizontal-start',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'rect',
      {
        width: '13',
        height: '7',
        x: '8',
        y: '3',
        rx: '1',
      },
    ],
    [
      'path',
      {
        d: 'm2 9 3 3-3 3',
      },
    ],
    [
      'rect',
      {
        width: '13',
        height: '7',
        x: '8',
        y: '14',
        rx: '1',
      },
    ],
  ],
} as const satisfies IconDefinition;
