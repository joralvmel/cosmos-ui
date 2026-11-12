import type { IconDefinition } from '../index.js';

export const galleryHorizontalEnd = {
  name: 'gallery-horizontal-end',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M2 7v10',
      },
    ],
    [
      'path',
      {
        d: 'M6 5v14',
      },
    ],
    [
      'rect',
      {
        width: '12',
        height: '18',
        x: '10',
        y: '3',
        rx: '2',
      },
    ],
  ],
} as const satisfies IconDefinition;
