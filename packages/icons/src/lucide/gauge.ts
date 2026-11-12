import type { IconDefinition } from '../index.js';

export const gauge = {
  name: 'gauge',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'm12 14 4-4',
      },
    ],
    [
      'path',
      {
        d: 'M3.34 19a10 10 0 1 1 17.32 0',
      },
    ],
  ],
} as const satisfies IconDefinition;
