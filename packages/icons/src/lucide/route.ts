import type { IconDefinition } from '../index.js';

export const route = {
  name: 'route',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M9 5h8.5a1 1 0 010 7h-11a1 1 0 000 7H15',
      },
    ],
    [
      'circle',
      {
        cx: '18',
        cy: '19',
        r: '3',
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
