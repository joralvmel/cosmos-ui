import type { IconDefinition } from '../index.js';

export const arrowRight = {
  name: 'arrow-right',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M5 12h14',
      },
    ],
    [
      'path',
      {
        d: 'm12 5 7 7-7 7',
      },
    ],
  ],
} as const satisfies IconDefinition;
