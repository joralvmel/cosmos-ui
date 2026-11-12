import type { IconDefinition } from '../index.js';

export const squareArrowDownEnter = {
  name: 'square-arrow-down-enter',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M12 3v10',
      },
    ],
    [
      'path',
      {
        d: 'M16 3h3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h3',
      },
    ],
    [
      'path',
      {
        d: 'm8 9 4 4 4-4',
      },
    ],
  ],
} as const satisfies IconDefinition;
