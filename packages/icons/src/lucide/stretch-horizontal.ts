import type { IconDefinition } from '../index.js';

export const stretchHorizontal = {
  name: 'stretch-horizontal',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'rect',
      {
        width: '20',
        height: '6',
        x: '2',
        y: '4',
        rx: '2',
      },
    ],
    [
      'rect',
      {
        width: '20',
        height: '6',
        x: '2',
        y: '14',
        rx: '2',
      },
    ],
  ],
} as const satisfies IconDefinition;
