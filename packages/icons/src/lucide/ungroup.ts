import type { IconDefinition } from '../index.js';

export const ungroup = {
  name: 'ungroup',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'rect',
      {
        x: '11',
        y: '14',
        width: '10',
        height: '7',
        rx: '2',
      },
    ],
    [
      'rect',
      {
        x: '3',
        y: '3',
        width: '10',
        height: '7',
        rx: '2',
      },
    ],
  ],
} as const satisfies IconDefinition;
