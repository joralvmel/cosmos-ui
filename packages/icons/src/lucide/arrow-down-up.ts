import type { IconDefinition } from '../index.js';

export const arrowDownUp = {
  name: 'arrow-down-up',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'm3 16 4 4 4-4',
      },
    ],
    [
      'path',
      {
        d: 'M7 20V4',
      },
    ],
    [
      'path',
      {
        d: 'm21 8-4-4-4 4',
      },
    ],
    [
      'path',
      {
        d: 'M17 4v16',
      },
    ],
  ],
} as const satisfies IconDefinition;
