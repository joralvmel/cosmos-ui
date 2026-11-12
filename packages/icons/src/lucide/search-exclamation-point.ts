import type { IconDefinition } from '../index.js';

export const searchExclamationPoint = {
  name: 'search-exclamation-point',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'circle',
      {
        cx: '11',
        cy: '11',
        r: '8',
      },
    ],
    [
      'path',
      {
        d: 'm21 21-4.3-4.3',
      },
    ],
    [
      'path',
      {
        d: 'M11 7v4',
      },
    ],
    [
      'path',
      {
        d: 'M11 15h.01',
      },
    ],
  ],
} as const satisfies IconDefinition;
