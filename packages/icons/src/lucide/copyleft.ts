import type { IconDefinition } from '../index.js';

export const copyleft = {
  name: 'copyleft',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'circle',
      {
        cx: '12',
        cy: '12',
        r: '10',
      },
    ],
    [
      'path',
      {
        d: 'M9.17 14.83a4 4 0 1 0 0-5.66',
      },
    ],
  ],
} as const satisfies IconDefinition;
