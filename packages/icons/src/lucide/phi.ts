import type { IconDefinition } from '../index.js';

export const phi = {
  name: 'phi',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M12 2v20',
      },
    ],
    [
      'circle',
      {
        cx: '12',
        cy: '12',
        r: '7',
      },
    ],
  ],
} as const satisfies IconDefinition;
