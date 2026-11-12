import type { IconDefinition } from '../index.js';

export const undoDot = {
  name: 'undo-dot',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M21 17a9 9 0 0 0-15-6.7L3 13',
      },
    ],
    [
      'path',
      {
        d: 'M3 7v6h6',
      },
    ],
    [
      'circle',
      {
        cx: '12',
        cy: '17',
        r: '1',
      },
    ],
  ],
} as const satisfies IconDefinition;
