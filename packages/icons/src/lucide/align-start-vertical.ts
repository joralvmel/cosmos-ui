import type { IconDefinition } from '../index.js';

export const alignStartVertical = {
  name: 'align-start-vertical',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'rect',
      {
        width: '9',
        height: '6',
        x: '6',
        y: '14',
        rx: '2',
      },
    ],
    [
      'rect',
      {
        width: '16',
        height: '6',
        x: '6',
        y: '4',
        rx: '2',
      },
    ],
    [
      'path',
      {
        d: 'M2 2v20',
      },
    ],
  ],
} as const satisfies IconDefinition;
