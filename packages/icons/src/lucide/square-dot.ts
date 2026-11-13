import type { IconDefinition } from '../index.js';

export const squareDot = {
  name: 'square-dot',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'rect',
      {
        width: '18',
        height: '18',
        x: '3',
        y: '3',
        rx: '2',
      },
    ],
    [
      'circle',
      {
        cx: '12',
        cy: '12',
        r: '1',
      },
    ],
  ],
} as const satisfies IconDefinition;
