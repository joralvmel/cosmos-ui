import type { IconDefinition } from '../index.js';

export const faceExpressionless = {
  name: 'face-expressionless',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M14 10h2',
      },
    ],
    [
      'path',
      {
        d: 'M8 10h2',
      },
    ],
    [
      'path',
      {
        d: 'M8 16h8',
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
