import type { IconDefinition } from '../index.js';

export const circlePause = {
  name: 'circle-pause',
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
        x1: '10',
        x2: '10',
        y1: '15',
        y2: '9',
      },
    ],
    [
      'line',
      {
        x1: '14',
        x2: '14',
        y1: '15',
        y2: '9',
      },
    ],
  ],
} as const satisfies IconDefinition;
