import type { IconDefinition } from '../index.js';

export const percent = {
  name: 'percent',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'line',
      {
        x1: '19',
        x2: '5',
        y1: '5',
        y2: '19',
      },
    ],
    [
      'circle',
      {
        cx: '6.5',
        cy: '6.5',
        r: '2.5',
      },
    ],
    [
      'circle',
      {
        cx: '17.5',
        cy: '17.5',
        r: '2.5',
      },
    ],
  ],
} as const satisfies IconDefinition;
