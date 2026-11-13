import type { IconDefinition } from '../index.js';

export const searchCode = {
  name: 'search-code',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'm13 13.5 2-2.5-2-2.5',
      },
    ],
    [
      'path',
      {
        d: 'm21 21-4.3-4.3',
      },
    ],
    [
      'path',
      {
        d: 'M9 8.5 7 11l2 2.5',
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
  ],
} as const satisfies IconDefinition;
