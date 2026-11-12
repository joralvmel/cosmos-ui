import type { IconDefinition } from '../index.js';

export const arrowRightToLine = {
  name: 'arrow-right-to-line',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M17 12H3',
      },
    ],
    [
      'path',
      {
        d: 'm11 18 6-6-6-6',
      },
    ],
    [
      'path',
      {
        d: 'M21 5v14',
      },
    ],
  ],
} as const satisfies IconDefinition;
