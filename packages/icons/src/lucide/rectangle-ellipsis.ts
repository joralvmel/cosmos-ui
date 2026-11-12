import type { IconDefinition } from '../index.js';

export const rectangleEllipsis = {
  name: 'rectangle-ellipsis',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'rect',
      {
        width: '20',
        height: '12',
        x: '2',
        y: '6',
        rx: '2',
      },
    ],
    [
      'path',
      {
        d: 'M12 12h.01',
      },
    ],
    [
      'path',
      {
        d: 'M17 12h.01',
      },
    ],
    [
      'path',
      {
        d: 'M7 12h.01',
      },
    ],
  ],
} as const satisfies IconDefinition;
