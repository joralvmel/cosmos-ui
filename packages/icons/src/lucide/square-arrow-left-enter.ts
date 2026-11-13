import type { IconDefinition } from '../index.js';

export const squareArrowLeftEnter = {
  name: 'square-arrow-left-enter',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'm15 8-4 4 4 4',
      },
    ],
    [
      'path',
      {
        d: 'M21 12H11',
      },
    ],
    [
      'path',
      {
        d: 'M21 16v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v3',
      },
    ],
  ],
} as const satisfies IconDefinition;
