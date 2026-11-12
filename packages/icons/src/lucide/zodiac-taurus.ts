import type { IconDefinition } from '../index.js';

export const zodiacTaurus = {
  name: 'zodiac-taurus',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'circle',
      {
        cx: '12',
        cy: '15',
        r: '6',
      },
    ],
    [
      'path',
      {
        d: 'M18 3A6 6 0 0 1 6 3',
      },
    ],
  ],
} as const satisfies IconDefinition;
