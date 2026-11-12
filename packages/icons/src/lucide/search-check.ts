import type { IconDefinition } from '../index.js';

export const searchCheck = {
  name: 'search-check',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'm8 11 2 2 4-4',
      },
    ],
    [
      'circle',
      {
        cx: '11',
        cy: '11',
        r: '8',
      },
    ],
    [
      'path',
      {
        d: 'm21 21-4.3-4.3',
      },
    ],
  ],
} as const satisfies IconDefinition;
