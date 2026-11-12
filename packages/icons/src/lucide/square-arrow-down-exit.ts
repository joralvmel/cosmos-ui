import type { IconDefinition } from '../index.js';

export const squareArrowDownExit = {
  name: 'square-arrow-down-exit',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M12 11v10',
      },
    ],
    [
      'path',
      {
        d: 'M17.67 21H19a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h1.33',
      },
    ],
    [
      'path',
      {
        d: 'm8 17 4 4 4-4',
      },
    ],
  ],
} as const satisfies IconDefinition;
