import type { IconDefinition } from '../index.js';

export const gripHorizontal = {
  name: 'grip-horizontal',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'circle',
      {
        cx: '12',
        cy: '9',
        r: '1',
      },
    ],
    [
      'circle',
      {
        cx: '19',
        cy: '9',
        r: '1',
      },
    ],
    [
      'circle',
      {
        cx: '5',
        cy: '9',
        r: '1',
      },
    ],
    [
      'circle',
      {
        cx: '12',
        cy: '15',
        r: '1',
      },
    ],
    [
      'circle',
      {
        cx: '19',
        cy: '15',
        r: '1',
      },
    ],
    [
      'circle',
      {
        cx: '5',
        cy: '15',
        r: '1',
      },
    ],
  ],
} as const satisfies IconDefinition;
