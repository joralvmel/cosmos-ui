import type { IconDefinition } from '../index.js';

export const alignEndVertical = {
  name: 'align-end-vertical',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'rect',
      {
        width: '16',
        height: '6',
        x: '2',
        y: '4',
        rx: '2',
      },
    ],
    [
      'rect',
      {
        width: '9',
        height: '6',
        x: '9',
        y: '14',
        rx: '2',
      },
    ],
    [
      'path',
      {
        d: 'M22 22V2',
      },
    ],
  ],
} as const satisfies IconDefinition;
