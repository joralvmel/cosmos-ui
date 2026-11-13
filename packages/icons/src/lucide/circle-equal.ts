import type { IconDefinition } from '../index.js';

export const circleEqual = {
  name: 'circle-equal',
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
        d: 'M7 10h10',
      },
    ],
    [
      'path',
      {
        d: 'M7 14h10',
      },
    ],
  ],
} as const satisfies IconDefinition;
