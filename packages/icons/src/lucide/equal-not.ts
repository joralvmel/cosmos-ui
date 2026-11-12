import type { IconDefinition } from '../index.js';

export const equalNot = {
  name: 'equal-not',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'line',
      {
        x1: '5',
        x2: '19',
        y1: '9',
        y2: '9',
      },
    ],
    [
      'line',
      {
        x1: '5',
        x2: '19',
        y1: '15',
        y2: '15',
      },
    ],
    [
      'line',
      {
        x1: '19',
        x2: '5',
        y1: '5',
        y2: '19',
      },
    ],
  ],
} as const satisfies IconDefinition;
