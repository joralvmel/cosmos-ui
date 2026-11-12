import type { IconDefinition } from '../index.js';

export const ratio = {
  name: 'ratio',
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
