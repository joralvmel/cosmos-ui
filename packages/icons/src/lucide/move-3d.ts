import type { IconDefinition } from '../index.js';

export const move3d = {
  name: 'move-3d',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M5 3v16h16',
      },
    ],
    [
      'path',
      {
        d: 'm5 19 6-6',
      },
    ],
    [
      'path',
      {
        d: 'm2 6 3-3 3 3',
      },
    ],
    [
      'path',
      {
        d: 'm18 16 3 3-3 3',
      },
    ],
  ],
} as const satisfies IconDefinition;
