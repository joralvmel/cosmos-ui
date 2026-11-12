import type { IconDefinition } from '../index.js';

export const alignHorizontalDistributeStart = {
  name: 'align-horizontal-distribute-start',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'rect',
      {
        width: '6',
        height: '14',
        x: '4',
        y: '5',
        rx: '2',
      },
    ],
    [
      'rect',
      {
        width: '6',
        height: '10',
        x: '14',
        y: '7',
        rx: '2',
      },
    ],
    [
      'path',
      {
        d: 'M4 2v20',
      },
    ],
    [
      'path',
      {
        d: 'M14 2v20',
      },
    ],
  ],
} as const satisfies IconDefinition;
