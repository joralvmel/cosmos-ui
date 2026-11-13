import type { IconDefinition } from '../index.js';

export const separatorHorizontal = {
  name: 'separator-horizontal',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'm16 16-4 4-4-4',
      },
    ],
    [
      'path',
      {
        d: 'M3 12h18',
      },
    ],
    [
      'path',
      {
        d: 'm8 8 4-4 4 4',
      },
    ],
  ],
} as const satisfies IconDefinition;
