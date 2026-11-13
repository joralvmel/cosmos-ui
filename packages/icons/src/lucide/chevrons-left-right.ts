import type { IconDefinition } from '../index.js';

export const chevronsLeftRight = {
  name: 'chevrons-left-right',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'm9 7-5 5 5 5',
      },
    ],
    [
      'path',
      {
        d: 'm15 7 5 5-5 5',
      },
    ],
  ],
} as const satisfies IconDefinition;
