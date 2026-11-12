import type { IconDefinition } from '../index.js';

export const move = {
  name: 'move',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M12 2v20',
      },
    ],
    [
      'path',
      {
        d: 'm15 19-3 3-3-3',
      },
    ],
    [
      'path',
      {
        d: 'm19 9 3 3-3 3',
      },
    ],
    [
      'path',
      {
        d: 'M2 12h20',
      },
    ],
    [
      'path',
      {
        d: 'm5 9-3 3 3 3',
      },
    ],
    [
      'path',
      {
        d: 'm9 5 3-3 3 3',
      },
    ],
  ],
} as const satisfies IconDefinition;
