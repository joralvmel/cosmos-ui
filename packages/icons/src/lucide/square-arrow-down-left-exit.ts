import type { IconDefinition } from '../index.js';

export const squareArrowDownLeftExit = {
  name: 'square-arrow-down-left-exit',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M13 21h6a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6',
      },
    ],
    [
      'path',
      {
        d: 'm3 21 9-9',
      },
    ],
    [
      'path',
      {
        d: 'M9 21H3v-6',
      },
    ],
  ],
} as const satisfies IconDefinition;
