import type { IconDefinition } from '../index.js';

export const cornerDownRight = {
  name: 'corner-down-right',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'm15 10 5 5-5 5',
      },
    ],
    [
      'path',
      {
        d: 'M4 4v7a4 4 0 0 0 4 4h12',
      },
    ],
  ],
} as const satisfies IconDefinition;
