import type { IconDefinition } from '../index.js';

export const circleLetterZ = {
  name: 'circle-letter-z',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M9 8h5.501a.5.5 0 0 1 .37.836L9.13 15.164A.5.5 0 0 0 9.5 16H15',
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
