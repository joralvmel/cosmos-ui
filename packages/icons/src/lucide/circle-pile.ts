import type { IconDefinition } from '../index.js';

export const circlePile = {
  name: 'circle-pile',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'circle',
      {
        cx: '12',
        cy: '19',
        r: '2',
      },
    ],
    [
      'circle',
      {
        cx: '12',
        cy: '5',
        r: '2',
      },
    ],
    [
      'circle',
      {
        cx: '16',
        cy: '12',
        r: '2',
      },
    ],
    [
      'circle',
      {
        cx: '20',
        cy: '19',
        r: '2',
      },
    ],
    [
      'circle',
      {
        cx: '4',
        cy: '19',
        r: '2',
      },
    ],
    [
      'circle',
      {
        cx: '8',
        cy: '12',
        r: '2',
      },
    ],
  ],
} as const satisfies IconDefinition;
