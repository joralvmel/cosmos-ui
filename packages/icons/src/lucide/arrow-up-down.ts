import type { IconDefinition } from '../index.js';

export const arrowUpDown = {
  name: 'arrow-up-down',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'm21 16-4 4-4-4',
      },
    ],
    [
      'path',
      {
        d: 'M17 20V4',
      },
    ],
    [
      'path',
      {
        d: 'm3 8 4-4 4 4',
      },
    ],
    [
      'path',
      {
        d: 'M7 4v16',
      },
    ],
  ],
} as const satisfies IconDefinition;
