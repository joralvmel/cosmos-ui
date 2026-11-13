import type { IconDefinition } from '../index.js';

export const bubbles = {
  name: 'bubbles',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M7.001 15.085A1.5 1.5 0 0 1 9 16.5',
      },
    ],
    [
      'circle',
      {
        cx: '18.5',
        cy: '8.5',
        r: '3.5',
      },
    ],
    [
      'circle',
      {
        cx: '7.5',
        cy: '16.5',
        r: '5.5',
      },
    ],
    [
      'circle',
      {
        cx: '7.5',
        cy: '4.5',
        r: '2.5',
      },
    ],
  ],
} as const satisfies IconDefinition;
