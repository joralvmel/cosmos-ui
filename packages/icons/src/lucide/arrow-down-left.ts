import type { IconDefinition } from '../index.js';

export const arrowDownLeft = {
  name: 'arrow-down-left',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M17 7 7 17',
      },
    ],
    [
      'path',
      {
        d: 'M17 17H7V7',
      },
    ],
  ],
} as const satisfies IconDefinition;
