import type { IconDefinition } from '../index.js';

export const caseLower = {
  name: 'case-lower',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M10 9v7',
      },
    ],
    [
      'path',
      {
        d: 'M14 6v10',
      },
    ],
    [
      'circle',
      {
        cx: '17.5',
        cy: '12.5',
        r: '3.5',
      },
    ],
    [
      'circle',
      {
        cx: '6.5',
        cy: '12.5',
        r: '3.5',
      },
    ],
  ],
} as const satisfies IconDefinition;
