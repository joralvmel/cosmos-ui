import type { IconDefinition } from '../index.js';

export const forward = {
  name: 'forward',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'm15 17 5-5-5-5',
      },
    ],
    [
      'path',
      {
        d: 'M4 18v-2a4 4 0 0 1 4-4h12',
      },
    ],
  ],
} as const satisfies IconDefinition;
