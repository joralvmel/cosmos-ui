import type { IconDefinition } from '../index.js';

export const squircle = {
  name: 'squircle',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M12 3c7.2 0 9 1.8 9 9s-1.8 9-9 9-9-1.8-9-9 1.8-9 9-9',
      },
    ],
  ],
} as const satisfies IconDefinition;
