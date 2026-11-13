import type { IconDefinition } from '../index.js';

export const ellipsis = {
  name: 'ellipsis',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'circle',
      {
        cx: '12',
        cy: '12',
        r: '1',
      },
    ],
    [
      'circle',
      {
        cx: '19',
        cy: '12',
        r: '1',
      },
    ],
    [
      'circle',
      {
        cx: '5',
        cy: '12',
        r: '1',
      },
    ],
  ],
} as const satisfies IconDefinition;
