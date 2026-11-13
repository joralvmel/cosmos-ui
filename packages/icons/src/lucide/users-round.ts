import type { IconDefinition } from '../index.js';

export const usersRound = {
  name: 'users-round',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M18 21a8 8 0 0 0-16 0',
      },
    ],
    [
      'circle',
      {
        cx: '10',
        cy: '8',
        r: '5',
      },
    ],
    [
      'path',
      {
        d: 'M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3',
      },
    ],
  ],
} as const satisfies IconDefinition;
