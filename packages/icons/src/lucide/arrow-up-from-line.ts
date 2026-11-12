import type { IconDefinition } from '../index.js';

export const arrowUpFromLine = {
  name: 'arrow-up-from-line',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'm18 9-6-6-6 6',
      },
    ],
    [
      'path',
      {
        d: 'M12 3v14',
      },
    ],
    [
      'path',
      {
        d: 'M5 21h14',
      },
    ],
  ],
} as const satisfies IconDefinition;
