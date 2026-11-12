import type { IconDefinition } from '../index.js';

export const pause = {
  name: 'pause',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'rect',
      {
        x: '14',
        y: '3',
        width: '5',
        height: '18',
        rx: '1',
      },
    ],
    [
      'rect',
      {
        x: '5',
        y: '3',
        width: '5',
        height: '18',
        rx: '1',
      },
    ],
  ],
} as const satisfies IconDefinition;
