import type { IconDefinition } from '../index.js';

export const strokeLineCapButt = {
  name: 'stroke-line-cap-butt',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M14 12h2',
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
        d: 'M2 4h18a2 2 0 012 2v12a2 2 0 01-2 2H2',
      },
    ],
    [
      'path',
      {
        d: 'M20 12h2',
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
