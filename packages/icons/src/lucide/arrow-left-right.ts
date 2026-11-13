import type { IconDefinition } from '../index.js';

export const arrowLeftRight = {
  name: 'arrow-left-right',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M8 3 4 7l4 4',
      },
    ],
    [
      'path',
      {
        d: 'M4 7h16',
      },
    ],
    [
      'path',
      {
        d: 'm16 21 4-4-4-4',
      },
    ],
    [
      'path',
      {
        d: 'M20 17H4',
      },
    ],
  ],
} as const satisfies IconDefinition;
