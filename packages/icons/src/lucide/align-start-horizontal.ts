import type { IconDefinition } from '../index.js';

export const alignStartHorizontal = {
  name: 'align-start-horizontal',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'rect',
      {
        width: '6',
        height: '16',
        x: '4',
        y: '6',
        rx: '2',
      },
    ],
    [
      'rect',
      {
        width: '6',
        height: '9',
        x: '14',
        y: '6',
        rx: '2',
      },
    ],
    [
      'path',
      {
        d: 'M22 2H2',
      },
    ],
  ],
} as const satisfies IconDefinition;
