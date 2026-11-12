import type { IconDefinition } from '../index.js';

export const rows3 = {
  name: 'rows-3',
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
        d: 'M21 9H3',
      },
    ],
    [
      'path',
      {
        d: 'M21 15H3',
      },
    ],
  ],
} as const satisfies IconDefinition;
