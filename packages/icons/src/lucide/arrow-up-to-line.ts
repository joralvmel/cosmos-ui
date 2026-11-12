import type { IconDefinition } from '../index.js';

export const arrowUpToLine = {
  name: 'arrow-up-to-line',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M5 3h14',
      },
    ],
    [
      'path',
      {
        d: 'm18 13-6-6-6 6',
      },
    ],
    [
      'path',
      {
        d: 'M12 7v14',
      },
    ],
  ],
} as const satisfies IconDefinition;
