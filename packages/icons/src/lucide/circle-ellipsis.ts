import type { IconDefinition } from '../index.js';

export const circleEllipsis = {
  name: 'circle-ellipsis',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'circle',
      {
        cx: '12',
        cy: '12',
        r: '10',
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
        d: 'M12 12h.01',
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
