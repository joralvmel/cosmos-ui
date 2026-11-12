import type { IconDefinition } from '../index.js';

export const circleCheck = {
  name: 'circle-check',
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
        d: 'm16 9-5.5 5.5L8 12',
      },
    ],
  ],
} as const satisfies IconDefinition;
