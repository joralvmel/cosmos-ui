import type { IconDefinition } from '../index.js';

export const option = {
  name: 'option',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M14 3h7',
      },
    ],
    [
      'path',
      {
        d: 'M3 3h5.28a1 1 0 0 1 .948.684l5.544 16.632a1 1 0 0 0 .949.684H21',
      },
    ],
  ],
} as const satisfies IconDefinition;
