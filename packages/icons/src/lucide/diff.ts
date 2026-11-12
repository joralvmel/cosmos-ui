import type { IconDefinition } from '../index.js';

export const diff = {
  name: 'diff',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M12 3v14',
      },
    ],
    [
      'path',
      {
        d: 'M5 10h14',
      },
    ],
    [
      'path',
      {
        d: 'M5 21h14',
      },
    ],
  ],
} as const satisfies IconDefinition;
