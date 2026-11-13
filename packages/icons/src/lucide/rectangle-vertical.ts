import type { IconDefinition } from '../index.js';

export const rectangleVertical = {
  name: 'rectangle-vertical',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'rect',
      {
        width: '12',
        height: '20',
        x: '6',
        y: '2',
        rx: '2',
      },
    ],
  ],
} as const satisfies IconDefinition;
