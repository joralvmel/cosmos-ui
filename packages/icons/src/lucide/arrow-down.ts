import type { IconDefinition } from '../index.js';

export const arrowDown = {
  name: 'arrow-down',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M12 5v14',
      },
    ],
    [
      'path',
      {
        d: 'm19 12-7 7-7-7',
      },
    ],
  ],
} as const satisfies IconDefinition;
