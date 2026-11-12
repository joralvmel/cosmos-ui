import type { IconDefinition } from '../index.js';

export const arrowDownRight = {
  name: 'arrow-down-right',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'm7 7 10 10',
      },
    ],
    [
      'path',
      {
        d: 'M17 7v10H7',
      },
    ],
  ],
} as const satisfies IconDefinition;
