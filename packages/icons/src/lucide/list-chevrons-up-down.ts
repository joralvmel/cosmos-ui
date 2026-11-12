import type { IconDefinition } from '../index.js';

export const listChevronsUpDown = {
  name: 'list-chevrons-up-down',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M3 5h8',
      },
    ],
    [
      'path',
      {
        d: 'M3 12h8',
      },
    ],
    [
      'path',
      {
        d: 'M3 19h8',
      },
    ],
    [
      'path',
      {
        d: 'm15 8 3-3 3 3',
      },
    ],
    [
      'path',
      {
        d: 'm15 16 3 3 3-3',
      },
    ],
  ],
} as const satisfies IconDefinition;
