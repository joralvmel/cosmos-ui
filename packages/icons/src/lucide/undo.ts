import type { IconDefinition } from '../index.js';

export const undo = {
  name: 'undo',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M3 7v6h6',
      },
    ],
    [
      'path',
      {
        d: 'M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13',
      },
    ],
  ],
} as const satisfies IconDefinition;
