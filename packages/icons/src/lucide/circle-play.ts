import type { IconDefinition } from '../index.js';

export const circlePlay = {
  name: 'circle-play',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M9 9.003a1 1 0 0 1 1.517-.859l4.997 2.997a1 1 0 0 1 0 1.718l-4.997 2.997A1 1 0 0 1 9 14.996z',
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
