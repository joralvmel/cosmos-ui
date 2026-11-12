import type { IconDefinition } from '../index.js';

export const equalApproximately = {
  name: 'equal-approximately',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M5 15a6.5 6.5 0 0 1 7 0 6.5 6.5 0 0 0 7 0',
      },
    ],
    [
      'path',
      {
        d: 'M5 9a6.5 6.5 0 0 1 7 0 6.5 6.5 0 0 0 7 0',
      },
    ],
  ],
} as const satisfies IconDefinition;
