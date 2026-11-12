import type { IconDefinition } from '../index.js';

export const circleSlash = {
  name: 'circle-slash',
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
      'line',
      {
        x1: '9',
        x2: '15',
        y1: '15',
        y2: '9',
      },
    ],
  ],
} as const satisfies IconDefinition;
