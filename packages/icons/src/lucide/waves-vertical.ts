import type { IconDefinition } from '../index.js';

export const wavesVertical = {
  name: 'waves-vertical',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M12 2q2 2.5 0 5t0 5 0 5 0 5',
      },
    ],
    [
      'path',
      {
        d: 'M19 2q2 2.5 0 5t0 5 0 5 0 5',
      },
    ],
    [
      'path',
      {
        d: 'M5 2q2 2.5 0 5t0 5 0 5 0 5',
      },
    ],
  ],
} as const satisfies IconDefinition;
