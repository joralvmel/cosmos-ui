import type { IconDefinition } from '../index.js';

export const circleLetterF = {
  name: 'circle-letter-f',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M9 16V8.5a.5.5 0 0 1 .5-.5H15',
      },
    ],
    [
      'path',
      {
        d: 'M9 12h4',
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
