import type { IconDefinition } from '../index.js';

export const arrowUpLeft = {
  name: 'arrow-up-left',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M7 17V7h10',
      },
    ],
    [
      'path',
      {
        d: 'M17 17 7 7',
      },
    ],
  ],
} as const satisfies IconDefinition;
