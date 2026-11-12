import type { IconDefinition } from '../index.js';

export const blend = {
  name: 'blend',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'circle',
      {
        cx: '15',
        cy: '9',
        r: '7',
      },
    ],
    [
      'circle',
      {
        cx: '9',
        cy: '15',
        r: '7',
      },
    ],
  ],
} as const satisfies IconDefinition;
