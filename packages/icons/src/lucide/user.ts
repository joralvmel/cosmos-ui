import type { IconDefinition } from '../index.js';

export const user = {
  name: 'user',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2',
      },
    ],
    [
      'circle',
      {
        cx: '12',
        cy: '7',
        r: '4',
      },
    ],
  ],
} as const satisfies IconDefinition;
