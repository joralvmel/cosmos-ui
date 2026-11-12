import type { IconDefinition } from '../index.js';

export const euro = {
  name: 'euro',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M4 10h12',
      },
    ],
    [
      'path',
      {
        d: 'M4 14h9',
      },
    ],
    [
      'path',
      {
        d: 'M19 6a7.7 7.7 0 0 0-5.2-2A7.9 7.9 0 0 0 6 12c0 4.4 3.5 8 7.8 8 2 0 3.8-.8 5.2-2',
      },
    ],
  ],
} as const satisfies IconDefinition;
