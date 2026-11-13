import type { IconDefinition } from '../index.js';

export const circleChevronsRight = {
  name: 'circle-chevrons-right',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M14 15L17 12L14 9',
      },
    ],
    [
      'path',
      {
        d: 'M8 15L11 12L8 9',
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
