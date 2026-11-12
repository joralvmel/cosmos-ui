import type { IconDefinition } from '../index.js';

export const calendar = {
  name: 'calendar',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M8 2v3',
      },
    ],
    [
      'path',
      {
        d: 'M16 2v3',
      },
    ],
    [
      'rect',
      {
        x: '3',
        y: '3',
        width: '18',
        height: '18',
        rx: '2',
      },
    ],
    [
      'path',
      {
        d: 'M3 9h18',
      },
    ],
  ],
} as const satisfies IconDefinition;
