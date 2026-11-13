import type { IconDefinition } from '../index.js';

export const tablet = {
  name: 'tablet',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'rect',
      {
        width: '16',
        height: '20',
        x: '4',
        y: '2',
        rx: '2',
        ry: '2',
      },
    ],
    [
      'line',
      {
        x1: '12',
        x2: '12.01',
        y1: '18',
        y2: '18',
      },
    ],
  ],
} as const satisfies IconDefinition;
