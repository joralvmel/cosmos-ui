import type { IconDefinition } from '../index.js';

export const handleBottomRight = {
  name: 'handle-bottom-right',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M21 8 8 21',
      },
    ],
    [
      'path',
      {
        d: 'm21 15-6 6',
      },
    ],
  ],
} as const satisfies IconDefinition;
