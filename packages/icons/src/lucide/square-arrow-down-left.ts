import type { IconDefinition } from '../index.js';

export const squareArrowDownLeft = {
  name: 'square-arrow-down-left',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M15 15H9l6-6',
      },
    ],
    [
      'path',
      {
        d: 'M9 15V9',
      },
    ],
    [
      'rect',
      {
        x: '3',
        y: '3',
        width: '18',
        height: '18',
        rx: '2',
      },
    ],
  ],
} as const satisfies IconDefinition;
