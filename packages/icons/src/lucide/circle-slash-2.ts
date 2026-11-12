import type { IconDefinition } from '../index.js';

export const circleSlash2 = {
  name: 'circle-slash-2',
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
        d: 'M22 2 2 22',
      },
    ],
  ],
} as const satisfies IconDefinition;
