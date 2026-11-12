import type { IconDefinition } from '../index.js';

export const zoomOut = {
  name: 'zoom-out',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'circle',
      {
        cx: '11',
        cy: '11',
        r: '8',
      },
    ],
    [
      'line',
      {
        x1: '21',
        x2: '16.65',
        y1: '21',
        y2: '16.65',
      },
    ],
    [
      'line',
      {
        x1: '8',
        x2: '14',
        y1: '11',
        y2: '11',
      },
    ],
  ],
} as const satisfies IconDefinition;
