import type { IconDefinition } from '../index.js';

export const textSearch = {
  name: 'text-search',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M21 5H3',
      },
    ],
    [
      'path',
      {
        d: 'M10 12H3',
      },
    ],
    [
      'path',
      {
        d: 'M10 19H3',
      },
    ],
    [
      'circle',
      {
        cx: '17',
        cy: '15',
        r: '3',
      },
    ],
    [
      'path',
      {
        d: 'm21 19-1.9-1.9',
      },
    ],
  ],
} as const satisfies IconDefinition;
