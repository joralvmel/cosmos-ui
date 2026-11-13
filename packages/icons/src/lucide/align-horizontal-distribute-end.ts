import type { IconDefinition } from '../index.js';

export const alignHorizontalDistributeEnd = {
  name: 'align-horizontal-distribute-end',
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
        d: 'M10 2v20',
      },
    ],
    [
      'path',
      {
        d: 'M20 2v20',
      },
    ],
  ],
} as const satisfies IconDefinition;
