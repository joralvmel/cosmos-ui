import type { IconDefinition } from '../index.js';

export const circleLetterE = {
  name: 'circle-letter-e',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M15 8H9.5a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 .5.5H15',
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
