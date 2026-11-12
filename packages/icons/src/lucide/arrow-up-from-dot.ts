import type { IconDefinition } from '../index.js';

export const arrowUpFromDot = {
  name: 'arrow-up-from-dot',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'm5 9 7-7 7 7',
      },
    ],
    [
      'path',
      {
        d: 'M12 16V2',
      },
    ],
    [
      'circle',
      {
        cx: '12',
        cy: '21',
        r: '1',
      },
    ],
  ],
} as const satisfies IconDefinition;
