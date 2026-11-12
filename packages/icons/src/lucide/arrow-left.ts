import type { IconDefinition } from '../index.js';

export const arrowLeft = {
  name: 'arrow-left',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'm12 19-7-7 7-7',
      },
    ],
    [
      'path',
      {
        d: 'M19 12H5',
      },
    ],
  ],
} as const satisfies IconDefinition;
