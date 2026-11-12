import type { IconDefinition } from '../index.js';

export const eject = {
  name: 'eject',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M4 13a1 1 0 0 1-.72-1.695l7.257-7.668a2 2 0 0 1 2.926 0l7.256 7.668A1 1 0 0 1 20 13z',
      },
    ],
    [
      'rect',
      {
        x: '3',
        y: '17',
        width: '18',
        height: '4',
        rx: '1',
      },
    ],
  ],
} as const satisfies IconDefinition;
