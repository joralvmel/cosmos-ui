import type { IconDefinition } from '../index.js';

export const form = {
  name: 'form',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M4 14h6',
      },
    ],
    [
      'path',
      {
        d: 'M4 2h10',
      },
    ],
    [
      'rect',
      {
        x: '4',
        y: '18',
        width: '16',
        height: '4',
        rx: '1',
      },
    ],
    [
      'rect',
      {
        x: '4',
        y: '6',
        width: '16',
        height: '4',
        rx: '1',
      },
    ],
  ],
} as const satisfies IconDefinition;
