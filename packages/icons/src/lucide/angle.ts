import type { IconDefinition } from '../index.js';

export const angle = {
  name: 'angle',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M3 3v16a2 2 0 0 0 2 2h16',
      },
    ],
    [
      'path',
      {
        d: 'M3 11a10 10 0 0 1 10 10',
      },
    ],
  ],
} as const satisfies IconDefinition;
