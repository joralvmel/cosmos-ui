import type { IconDefinition } from '../index.js';

export const rss = {
  name: 'rss',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M4 11a9 9 0 0 1 9 9',
      },
    ],
    [
      'path',
      {
        d: 'M4 4a16 16 0 0 1 16 16',
      },
    ],
    [
      'circle',
      {
        cx: '5',
        cy: '19',
        r: '1',
      },
    ],
  ],
} as const satisfies IconDefinition;
