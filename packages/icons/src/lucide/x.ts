import type { IconDefinition } from '../index.js';

export const x = {
  name: 'x',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M18 6 6 18',
      },
    ],
    [
      'path',
      {
        d: 'm6 6 12 12',
      },
    ],
  ],
} as const satisfies IconDefinition;
