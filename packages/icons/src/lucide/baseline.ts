import type { IconDefinition } from '../index.js';

export const baseline = {
  name: 'baseline',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M4 20h16',
      },
    ],
    [
      'path',
      {
        d: 'm6 16 6-12 6 12',
      },
    ],
    [
      'path',
      {
        d: 'M8 12h8',
      },
    ],
  ],
} as const satisfies IconDefinition;
