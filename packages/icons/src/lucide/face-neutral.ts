import type { IconDefinition } from '../index.js';

export const faceNeutral = {
  name: 'face-neutral',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M15 10V9',
      },
    ],
    [
      'path',
      {
        d: 'M8 16h8',
      },
    ],
    [
      'path',
      {
        d: 'M9 10V9',
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
