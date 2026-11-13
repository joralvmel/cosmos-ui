import type { IconDefinition } from '../index.js';

export const lineDotRightHorizontal = {
  name: 'line-dot-right-horizontal',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M 3 12 L 15 12',
      },
    ],
    [
      'circle',
      {
        cx: '18',
        cy: '12',
        r: '3',
      },
    ],
  ],
} as const satisfies IconDefinition;
