import type { IconDefinition } from '../index.js';

export const plus = {
  name: 'plus',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M5 12h14',
      },
    ],
    [
      'path',
      {
        d: 'M12 5v14',
      },
    ],
  ],
} as const satisfies IconDefinition;
