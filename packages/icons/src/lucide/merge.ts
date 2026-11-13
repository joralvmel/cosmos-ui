import type { IconDefinition } from '../index.js';

export const merge = {
  name: 'merge',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'm8 6 4-4 4 4',
      },
    ],
    [
      'path',
      {
        d: 'M12 2v10.3a4 4 0 0 1-1.172 2.872L4 22',
      },
    ],
    [
      'path',
      {
        d: 'm20 22-5-5',
      },
    ],
  ],
} as const satisfies IconDefinition;
