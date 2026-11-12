import type { IconDefinition } from '../index.js';

export const arrowDownFromLine = {
  name: 'arrow-down-from-line',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M19 3H5',
      },
    ],
    [
      'path',
      {
        d: 'M12 21V7',
      },
    ],
    [
      'path',
      {
        d: 'm6 15 6 6 6-6',
      },
    ],
  ],
} as const satisfies IconDefinition;
