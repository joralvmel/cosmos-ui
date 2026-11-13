import type { IconDefinition } from '../index.js';

export const rows4 = {
  name: 'rows-4',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'rect',
      {
        width: '18',
        height: '18',
        x: '3',
        y: '3',
        rx: '2',
      },
    ],
    [
      'path',
      {
        d: 'M21 7.5H3',
      },
    ],
    [
      'path',
      {
        d: 'M21 12H3',
      },
    ],
    [
      'path',
      {
        d: 'M21 16.5H3',
      },
    ],
  ],
} as const satisfies IconDefinition;
