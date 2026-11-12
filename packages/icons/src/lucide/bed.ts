import type { IconDefinition } from '../index.js';

export const bed = {
  name: 'bed',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M2 4v16',
      },
    ],
    [
      'path',
      {
        d: 'M2 8h18a2 2 0 0 1 2 2v10',
      },
    ],
    [
      'path',
      {
        d: 'M2 17h20',
      },
    ],
    [
      'path',
      {
        d: 'M6 8v9',
      },
    ],
  ],
} as const satisfies IconDefinition;
