import type { IconDefinition } from '../index.js';

export const ellipsisVertical = {
  name: 'ellipsis-vertical',
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
        cx: '12',
        cy: '5',
        r: '1',
      },
    ],
    [
      'circle',
      {
        cx: '12',
        cy: '19',
        r: '1',
      },
    ],
  ],
} as const satisfies IconDefinition;
