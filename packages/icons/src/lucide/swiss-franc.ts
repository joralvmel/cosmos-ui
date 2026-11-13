import type { IconDefinition } from '../index.js';

export const swissFranc = {
  name: 'swiss-franc',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M10 10h7',
      },
    ],
    [
      'path',
      {
        d: 'M10 20V5a1 1 0 011-1h7',
      },
    ],
    [
      'path',
      {
        d: 'M6 16h9',
      },
    ],
  ],
} as const satisfies IconDefinition;
