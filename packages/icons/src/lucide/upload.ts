import type { IconDefinition } from '../index.js';

export const upload = {
  name: 'upload',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M12 3v12',
      },
    ],
    [
      'path',
      {
        d: 'm17 8-5-5-5 5',
      },
    ],
    [
      'path',
      {
        d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4',
      },
    ],
  ],
} as const satisfies IconDefinition;
