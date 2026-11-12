import type { IconDefinition } from '../index.js';

export const circleChevronsDown = {
  name: 'circle-chevrons-down',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M9 14L12 17L15 14',
      },
    ],
    [
      'path',
      {
        d: 'M9 8L12 11L15 8',
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
