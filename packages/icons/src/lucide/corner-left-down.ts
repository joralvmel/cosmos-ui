import type { IconDefinition } from '../index.js';

export const cornerLeftDown = {
  name: 'corner-left-down',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'm14 15-5 5-5-5',
      },
    ],
    [
      'path',
      {
        d: 'M20 4h-7a4 4 0 0 0-4 4v12',
      },
    ],
  ],
} as const satisfies IconDefinition;
