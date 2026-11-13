import type { IconDefinition } from '../index.js';

export const listMusic = {
  name: 'list-music',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M16 5H3',
      },
    ],
    [
      'path',
      {
        d: 'M11 12H3',
      },
    ],
    [
      'path',
      {
        d: 'M11 19H3',
      },
    ],
    [
      'path',
      {
        d: 'M21 16V5',
      },
    ],
    [
      'circle',
      {
        cx: '18',
        cy: '16',
        r: '3',
      },
    ],
  ],
} as const satisfies IconDefinition;
