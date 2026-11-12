import type { IconDefinition } from '../index.js';

export const hash = {
  name: 'hash',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'line',
      {
        x1: '4',
        x2: '20',
        y1: '9',
        y2: '9',
      },
    ],
    [
      'line',
      {
        x1: '4',
        x2: '20',
        y1: '15',
        y2: '15',
      },
    ],
    [
      'line',
      {
        x1: '10',
        x2: '8',
        y1: '3',
        y2: '21',
      },
    ],
    [
      'line',
      {
        x1: '16',
        x2: '14',
        y1: '3',
        y2: '21',
      },
    ],
  ],
} as const satisfies IconDefinition;
