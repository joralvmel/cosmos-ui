import type { IconDefinition } from '../index.js';

export const section = {
  name: 'section',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M16 5a4 3 0 0 0-8 0c0 4 8 3 8 7a4 3 0 0 1-8 0',
      },
    ],
    [
      'path',
      {
        d: 'M8 19a4 3 0 0 0 8 0c0-4-8-3-8-7a4 3 0 0 1 8 0',
      },
    ],
  ],
} as const satisfies IconDefinition;
