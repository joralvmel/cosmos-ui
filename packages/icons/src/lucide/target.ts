import type { IconDefinition } from '../index.js';

export const target = {
  name: 'target',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'circle',
      {
        cx: '12',
        cy: '12',
        r: '10',
      },
    ],
    [
      'circle',
      {
        cx: '12',
        cy: '12',
        r: '6',
      },
    ],
    [
      'circle',
      {
        cx: '12',
        cy: '12',
        r: '2',
      },
    ],
  ],
} as const satisfies IconDefinition;
