import type { IconDefinition } from '../index.js';

export const mouse = {
  name: 'mouse',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'rect',
      {
        x: '5',
        y: '2',
        width: '14',
        height: '20',
        rx: '7',
      },
    ],
    [
      'path',
      {
        d: 'M12 6v4',
      },
    ],
  ],
} as const satisfies IconDefinition;
