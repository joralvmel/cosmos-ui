import type { IconDefinition } from '../index.js';

export const alignEndHorizontal = {
  name: 'align-end-horizontal',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'rect',
      {
        width: '6',
        height: '16',
        x: '4',
        y: '2',
        rx: '2',
      },
    ],
    [
      'rect',
      {
        width: '6',
        height: '9',
        x: '14',
        y: '9',
        rx: '2',
      },
    ],
    [
      'path',
      {
        d: 'M22 22H2',
      },
    ],
  ],
} as const satisfies IconDefinition;
