import type { IconDefinition } from '../index.js';

export const menu = {
  name: 'menu',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M4 5h16',
      },
    ],
    [
      'path',
      {
        d: 'M4 12h16',
      },
    ],
    [
      'path',
      {
        d: 'M4 19h16',
      },
    ],
  ],
} as const satisfies IconDefinition;
