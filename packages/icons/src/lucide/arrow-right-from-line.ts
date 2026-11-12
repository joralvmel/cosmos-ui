import type { IconDefinition } from '../index.js';

export const arrowRightFromLine = {
  name: 'arrow-right-from-line',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M3 5v14',
      },
    ],
    [
      'path',
      {
        d: 'M21 12H7',
      },
    ],
    [
      'path',
      {
        d: 'm15 18 6-6-6-6',
      },
    ],
  ],
} as const satisfies IconDefinition;
