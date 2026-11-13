import type { IconDefinition } from '../index.js';

export const command = {
  name: 'command',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3',
      },
    ],
  ],
} as const satisfies IconDefinition;
