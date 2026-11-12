import type { IconDefinition } from '../index.js';

export const circleArrowUpLeftExit = {
  name: 'circle-arrow-up-left-exit',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M2 8V2h6',
      },
    ],
    [
      'path',
      {
        d: 'm2 2 10 10',
      },
    ],
    [
      'path',
      {
        d: 'M12 2A10 10 0 1 1 2 12',
      },
    ],
  ],
} as const satisfies IconDefinition;
