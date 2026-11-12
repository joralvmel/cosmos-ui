import type { IconDefinition } from '../index.js';

export const arrowLeftToLine = {
  name: 'arrow-left-to-line',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M3 19V5',
      },
    ],
    [
      'path',
      {
        d: 'm13 6-6 6 6 6',
      },
    ],
    [
      'path',
      {
        d: 'M7 12h14',
      },
    ],
  ],
} as const satisfies IconDefinition;
