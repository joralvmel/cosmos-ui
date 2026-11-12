import type { IconDefinition } from '../index.js';

export const logOut = {
  name: 'log-out',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'm16 17 5-5-5-5',
      },
    ],
    [
      'path',
      {
        d: 'M21 12H9',
      },
    ],
    [
      'path',
      {
        d: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4',
      },
    ],
  ],
} as const satisfies IconDefinition;
