import type { IconDefinition } from '../index.js';

export const circleLetterG = {
  name: 'circle-letter-g',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M12.5 12H15v2.268a.88.88 0 01-.263.65A4 4 0 1112 8h2.5',
      },
    ],
    [
      'circle',
      {
        cx: '12',
        cy: '12',
        r: '10',
      },
    ],
  ],
} as const satisfies IconDefinition;
