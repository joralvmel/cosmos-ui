import type { IconDefinition } from '../index.js';

export const circleMinus = {
  name: 'circle-minus',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'circle',
      {
        cx: '12',
        cy: '12',
        r: '10',
      },
    ],
    [
      'path',
      {
        d: 'M8 12h8',
      },
    ],
  ],
} as const satisfies IconDefinition;
