import type { IconDefinition } from '../index.js';

export const beaker = {
  name: 'beaker',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M4.5 3h15',
      },
    ],
    [
      'path',
      {
        d: 'M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3',
      },
    ],
    [
      'path',
      {
        d: 'M6 14h12',
      },
    ],
  ],
} as const satisfies IconDefinition;
