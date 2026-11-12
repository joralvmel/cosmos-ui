import type { IconDefinition } from '../index.js';

export const pilcrow = {
  name: 'pilcrow',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M13 4v16',
      },
    ],
    [
      'path',
      {
        d: 'M17 4v16',
      },
    ],
    [
      'path',
      {
        d: 'M19 4H9.5a4.5 4.5 0 0 0 0 9H13',
      },
    ],
  ],
} as const satisfies IconDefinition;
