import type { IconDefinition } from '../index.js';

export const alignHorizontalJustifyEnd = {
  name: 'align-horizontal-justify-end',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'rect',
      {
        width: '6',
        height: '14',
        x: '2',
        y: '5',
        rx: '2',
      },
    ],
    [
      'rect',
      {
        width: '6',
        height: '10',
        x: '12',
        y: '7',
        rx: '2',
      },
    ],
    [
      'path',
      {
        d: 'M22 2v20',
      },
    ],
  ],
} as const satisfies IconDefinition;
