import type { IconDefinition } from '../index.js';

export const circleLetterY = {
  name: 'circle-letter-y',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'm9 8 3 4 3-4',
      },
    ],
    [
      'path',
      {
        d: 'M12 12v4',
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
