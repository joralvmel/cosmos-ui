import type { IconDefinition } from '../index.js';

export const lineDotLeftHorizontal = {
  name: 'line-dot-left-horizontal',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M9 12h12',
      },
    ],
    [
      'circle',
      {
        cx: '6',
        cy: '12',
        r: '3',
      },
    ],
  ],
} as const satisfies IconDefinition;
