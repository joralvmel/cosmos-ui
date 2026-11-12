import type { IconDefinition } from '../index.js';

export const circleArrowLeft = {
  name: 'circle-arrow-left',
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
      'path',
      {
        d: 'm12 8-4 4 4 4',
      },
    ],
    [
      'path',
      {
        d: 'M16 12H8',
      },
    ],
  ],
} as const satisfies IconDefinition;
