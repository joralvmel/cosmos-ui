import type { IconDefinition } from '../index.js';

export const tvMinimal = {
  name: 'tv-minimal',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M7 21h10',
      },
    ],
    [
      'rect',
      {
        width: '20',
        height: '14',
        x: '2',
        y: '3',
        rx: '2',
      },
    ],
  ],
} as const satisfies IconDefinition;
