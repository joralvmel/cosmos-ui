import type { IconDefinition } from '../index.js';

export const arrowRightLeft = {
  name: 'arrow-right-left',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'm16 3 4 4-4 4',
      },
    ],
    [
      'path',
      {
        d: 'M20 7H4',
      },
    ],
    [
      'path',
      {
        d: 'm8 21-4-4 4-4',
      },
    ],
    [
      'path',
      {
        d: 'M4 17h16',
      },
    ],
  ],
} as const satisfies IconDefinition;
