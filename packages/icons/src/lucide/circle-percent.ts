import type { IconDefinition } from '../index.js';

export const circlePercent = {
  name: 'circle-percent',
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
        d: 'm15 9-6 6',
      },
    ],
    [
      'path',
      {
        d: 'M9 9h.01',
      },
    ],
    [
      'path',
      {
        d: 'M15 15h.01',
      },
    ],
  ],
} as const satisfies IconDefinition;
