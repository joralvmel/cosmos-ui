import type { IconDefinition } from '../index.js';

export const heading2 = {
  name: 'heading-2',
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
        d: 'M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1',
      },
    ],
  ],
} as const satisfies IconDefinition;
