import type { IconDefinition } from '../index.js';

export const circleChevronLeft = {
  name: 'circle-chevron-left',
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
        d: 'm14 16-4-4 4-4',
      },
    ],
  ],
} as const satisfies IconDefinition;
