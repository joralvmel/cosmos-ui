import type { IconDefinition } from '../index.js';

export const listCollapse = {
  name: 'list-collapse',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M10 5h11',
      },
    ],
    [
      'path',
      {
        d: 'M10 12h11',
      },
    ],
    [
      'path',
      {
        d: 'M10 19h11',
      },
    ],
    [
      'path',
      {
        d: 'm3 10 3-3-3-3',
      },
    ],
    [
      'path',
      {
        d: 'm3 20 3-3-3-3',
      },
    ],
  ],
} as const satisfies IconDefinition;
