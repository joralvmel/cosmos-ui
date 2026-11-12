import type { IconDefinition } from '../index.js';

export const cornerDownLeft = {
  name: 'corner-down-left',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M20 4v7a4 4 0 0 1-4 4H4',
      },
    ],
    [
      'path',
      {
        d: 'm9 10-5 5 5 5',
      },
    ],
  ],
} as const satisfies IconDefinition;
