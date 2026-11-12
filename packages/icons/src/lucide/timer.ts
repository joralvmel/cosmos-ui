import type { IconDefinition } from '../index.js';

export const timer = {
  name: 'timer',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'line',
      {
        x1: '10',
        x2: '14',
        y1: '2',
        y2: '2',
      },
    ],
    [
      'line',
      {
        x1: '12',
        x2: '15',
        y1: '14',
        y2: '11',
      },
    ],
    [
      'circle',
      {
        cx: '12',
        cy: '14',
        r: '8',
      },
    ],
  ],
} as const satisfies IconDefinition;
