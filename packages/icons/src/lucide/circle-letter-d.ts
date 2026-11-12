import type { IconDefinition } from '../index.js';

export const circleLetterD = {
  name: 'circle-letter-d',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M12 8a4 4 0 010 8H9.412A.41.41 0 019 15.588V8.412A.41.41 0 019.412 8z',
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
