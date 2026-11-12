import type { IconDefinition } from '../index.js';

export const maximize2 = {
  name: 'maximize-2',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M15 3h6v6',
      },
    ],
    [
      'path',
      {
        d: 'm21 3-7 7',
      },
    ],
    [
      'path',
      {
        d: 'm3 21 7-7',
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
