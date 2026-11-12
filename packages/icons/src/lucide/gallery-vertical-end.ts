import type { IconDefinition } from '../index.js';

export const galleryVerticalEnd = {
  name: 'gallery-vertical-end',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M7 2h10',
      },
    ],
    [
      'path',
      {
        d: 'M5 6h14',
      },
    ],
    [
      'rect',
      {
        width: '18',
        height: '12',
        x: '3',
        y: '10',
        rx: '2',
      },
    ],
  ],
} as const satisfies IconDefinition;
