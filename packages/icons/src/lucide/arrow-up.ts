import type { IconDefinition } from '../index.js';

export const arrowUp = {
  name: 'arrow-up',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'm5 12 7-7 7 7',
      },
    ],
    [
      'path',
      {
        d: 'M12 19V5',
      },
    ],
  ],
} as const satisfies IconDefinition;
