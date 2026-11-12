import type { IconDefinition } from '../index.js';

export const circlePlus = {
  name: 'circle-plus',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'circle',
      {
        cx: '12',
        cy: '12',
        r: '10',
      },
    ],
    [
      'path',
      {
        d: 'M8 12h8',
      },
    ],
    [
      'path',
      {
        d: 'M12 8v8',
      },
    ],
  ],
} as const satisfies IconDefinition;
