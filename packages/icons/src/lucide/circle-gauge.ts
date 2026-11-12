import type { IconDefinition } from '../index.js';

export const circleGauge = {
  name: 'circle-gauge',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M15.6 2.7a10 10 0 1 0 5.7 5.7',
      },
    ],
    [
      'circle',
      {
        cx: '12',
        cy: '12',
        r: '2',
      },
    ],
    [
      'path',
      {
        d: 'M13.4 10.6 19 5',
      },
    ],
  ],
} as const satisfies IconDefinition;
