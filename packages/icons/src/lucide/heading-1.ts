import type { IconDefinition } from '../index.js';

export const heading1 = {
  name: 'heading-1',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M4 12h8',
      },
    ],
    [
      'path',
      {
        d: 'M4 18V6',
      },
    ],
    [
      'path',
      {
        d: 'M12 18V6',
      },
    ],
    [
      'path',
      {
        d: 'm17 12 3-2v8',
      },
    ],
  ],
} as const satisfies IconDefinition;
