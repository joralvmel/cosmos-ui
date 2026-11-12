import type { IconDefinition } from '../index.js';

export const rectangleHorizontal = {
  name: 'rectangle-horizontal',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'rect',
      {
        width: '20',
        height: '12',
        x: '2',
        y: '6',
        rx: '2',
      },
    ],
  ],
} as const satisfies IconDefinition;
