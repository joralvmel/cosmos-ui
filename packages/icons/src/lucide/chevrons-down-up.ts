import type { IconDefinition } from '../index.js';

export const chevronsDownUp = {
  name: 'chevrons-down-up',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'm7 20 5-5 5 5',
      },
    ],
    [
      'path',
      {
        d: 'm7 4 5 5 5-5',
      },
    ],
  ],
} as const satisfies IconDefinition;
