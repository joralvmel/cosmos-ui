import type { IconDefinition } from '../index.js';

export const squareDashedBottom = {
  name: 'square-dashed-bottom',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M5 21a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2',
      },
    ],
    [
      'path',
      {
        d: 'M9 21h1',
      },
    ],
    [
      'path',
      {
        d: 'M14 21h1',
      },
    ],
  ],
} as const satisfies IconDefinition;
