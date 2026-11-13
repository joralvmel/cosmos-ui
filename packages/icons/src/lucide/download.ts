import type { IconDefinition } from '../index.js';

export const download = {
  name: 'download',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M12 15V3',
      },
    ],
    [
      'path',
      {
        d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4',
      },
    ],
    [
      'path',
      {
        d: 'm7 10 5 5 5-5',
      },
    ],
  ],
} as const satisfies IconDefinition;
