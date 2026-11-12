import type { IconDefinition } from '../index.js';

export const routeArrowRight = {
  name: 'route-arrow-right',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'm18 22 3-3-3-3',
      },
    ],
    [
      'path',
      {
        d: 'M9 5h8.5a1 1 0 010 7h-11a1 1 0 000 7H21',
      },
    ],
    [
      'circle',
      {
        cx: '6',
        cy: '5',
        r: '3',
      },
    ],
  ],
} as const satisfies IconDefinition;
