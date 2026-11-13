import type { IconDefinition } from '../index.js';

export const strokeLineCapRound = {
  name: 'stroke-line-cap-round',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M13.99 12H14',
      },
    ],
    [
      'path',
      {
        d: 'M2 12h2',
      },
    ],
    [
      'path',
      {
        d: 'M2 4h12a8 8 0 010 16H2',
      },
    ],
    [
      'path',
      {
        d: 'M8 12h2',
      },
    ],
  ],
} as const satisfies IconDefinition;
