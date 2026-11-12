import type { IconDefinition } from '../index.js';

export const ellipse = {
  name: 'ellipse',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'ellipse',
      {
        cx: '12',
        cy: '12',
        rx: '10',
        ry: '6',
      },
    ],
  ],
} as const satisfies IconDefinition;
