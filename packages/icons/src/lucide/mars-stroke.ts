import type { IconDefinition } from '../index.js';

export const marsStroke = {
  name: 'mars-stroke',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'm14 6 4 4',
      },
    ],
    [
      'path',
      {
        d: 'M17 3h4v4',
      },
    ],
    [
      'path',
      {
        d: 'm21 3-7.75 7.75',
      },
    ],
    [
      'circle',
      {
        cx: '9',
        cy: '15',
        r: '6',
      },
    ],
  ],
} as const satisfies IconDefinition;
