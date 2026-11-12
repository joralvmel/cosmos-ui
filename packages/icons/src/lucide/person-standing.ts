import type { IconDefinition } from '../index.js';

export const personStanding = {
  name: 'person-standing',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'circle',
      {
        cx: '12',
        cy: '5',
        r: '1',
      },
    ],
    [
      'path',
      {
        d: 'm9 20 3-6 3 6',
      },
    ],
    [
      'path',
      {
        d: 'm6 8 6 2 6-2',
      },
    ],
    [
      'path',
      {
        d: 'M12 10v4',
      },
    ],
  ],
} as const satisfies IconDefinition;
