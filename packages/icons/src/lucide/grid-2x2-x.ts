import type { IconDefinition } from '../index.js';

export const grid2x2X = {
  name: 'grid-2x2-x',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M12 3v17a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1H3',
      },
    ],
    [
      'path',
      {
        d: 'm16.5 16.5 5 5',
      },
    ],
    [
      'path',
      {
        d: 'm16.5 21.5 5-5',
      },
    ],
  ],
} as const satisfies IconDefinition;
