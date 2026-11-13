import type { IconDefinition } from '../index.js';

export const squareUserRound = {
  name: 'square-user-round',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M18 21a6 6 0 0 0-12 0',
      },
    ],
    [
      'circle',
      {
        cx: '12',
        cy: '11',
        r: '4',
      },
    ],
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
  ],
} as const satisfies IconDefinition;
