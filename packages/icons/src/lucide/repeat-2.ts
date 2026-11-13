import type { IconDefinition } from '../index.js';

export const repeat2 = {
  name: 'repeat-2',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'm2 9 3-3 3 3',
      },
    ],
    [
      'path',
      {
        d: 'M13 18H7a2 2 0 0 1-2-2V6',
      },
    ],
    [
      'path',
      {
        d: 'm22 15-3 3-3-3',
      },
    ],
    [
      'path',
      {
        d: 'M11 6h6a2 2 0 0 1 2 2v10',
      },
    ],
  ],
} as const satisfies IconDefinition;
