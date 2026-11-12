import type { IconDefinition } from '../index.js';

export const circleSmall = {
  name: 'circle-small',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'circle',
      {
        cx: '12',
        cy: '12',
        r: '6',
      },
    ],
  ],
} as const satisfies IconDefinition;
