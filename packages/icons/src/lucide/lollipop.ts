import type { IconDefinition } from '../index.js';

export const lollipop = {
  name: 'lollipop',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'circle',
      {
        cx: '11',
        cy: '11',
        r: '8',
      },
    ],
    [
      'path',
      {
        d: 'm21 21-4.3-4.3',
      },
    ],
    [
      'path',
      {
        d: 'M11 11a2 2 0 0 0 4 0 4 4 0 0 0-8 0 6 6 0 0 0 12 0',
      },
    ],
  ],
} as const satisfies IconDefinition;
