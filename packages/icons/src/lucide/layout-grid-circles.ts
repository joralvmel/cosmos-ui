import type { IconDefinition } from '../index.js';

export const layoutGridCircles = {
  name: 'layout-grid-circles',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'circle',
      {
        cx: '17.5',
        cy: '17.5',
        r: '3.5',
      },
    ],
    [
      'circle',
      {
        cx: '17.5',
        cy: '6.5',
        r: '3.5',
      },
    ],
    [
      'circle',
      {
        cx: '6.5',
        cy: '17.5',
        r: '3.5',
      },
    ],
    [
      'circle',
      {
        cx: '6.5',
        cy: '6.5',
        r: '3.5',
      },
    ],
  ],
} as const satisfies IconDefinition;
