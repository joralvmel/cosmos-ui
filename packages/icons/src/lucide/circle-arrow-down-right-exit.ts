import type { IconDefinition } from '../index.js';

export const circleArrowDownRightExit = {
  name: 'circle-arrow-down-right-exit',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M12 22a10 10 0 1 1 10-10',
      },
    ],
    [
      'path',
      {
        d: 'M22 22 12 12',
      },
    ],
    [
      'path',
      {
        d: 'M22 16v6h-6',
      },
    ],
  ],
} as const satisfies IconDefinition;
