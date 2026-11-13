import type { IconDefinition } from '../index.js';

export const xLineTop = {
  name: 'x-line-top',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M18 4H6',
      },
    ],
    [
      'path',
      {
        d: 'M18 8 6 20',
      },
    ],
    [
      'path',
      {
        d: 'm6 8 12 12',
      },
    ],
  ],
} as const satisfies IconDefinition;
