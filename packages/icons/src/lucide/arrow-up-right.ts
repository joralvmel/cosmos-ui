import type { IconDefinition } from '../index.js';

export const arrowUpRight = {
  name: 'arrow-up-right',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M7 7h10v10',
      },
    ],
    [
      'path',
      {
        d: 'M7 17 17 7',
      },
    ],
  ],
} as const satisfies IconDefinition;
