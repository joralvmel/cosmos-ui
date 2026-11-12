import type { IconDefinition } from '../index.js';

export const chevronsUpDown = {
  name: 'chevrons-up-down',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'm7 15 5 5 5-5',
      },
    ],
    [
      'path',
      {
        d: 'm7 9 5-5 5 5',
      },
    ],
  ],
} as const satisfies IconDefinition;
