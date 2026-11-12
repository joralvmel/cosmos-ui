import type { IconDefinition } from '../index.js';

export const searchSlash = {
  name: 'search-slash',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'm13.5 8.5-5 5',
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
