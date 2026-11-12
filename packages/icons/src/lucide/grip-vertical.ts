import type { IconDefinition } from '../index.js';

export const gripVertical = {
  name: 'grip-vertical',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'circle',
      {
        cx: '9',
        cy: '12',
        r: '1',
      },
    ],
    [
      'circle',
      {
        cx: '9',
        cy: '5',
        r: '1',
      },
    ],
    [
      'circle',
      {
        cx: '9',
        cy: '19',
        r: '1',
      },
    ],
    [
      'circle',
      {
        cx: '15',
        cy: '12',
        r: '1',
      },
    ],
    [
      'circle',
      {
        cx: '15',
        cy: '5',
        r: '1',
      },
    ],
    [
      'circle',
      {
        cx: '15',
        cy: '19',
        r: '1',
      },
    ],
  ],
} as const satisfies IconDefinition;
