import type { IconDefinition } from '../index.js';

export const webcam = {
  name: 'webcam',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'circle',
      {
        cx: '12',
        cy: '10',
        r: '8',
      },
    ],
    [
      'circle',
      {
        cx: '12',
        cy: '10',
        r: '3',
      },
    ],
    [
      'path',
      {
        d: 'M7 22h10',
      },
    ],
    [
      'path',
      {
        d: 'M12 22v-4',
      },
    ],
  ],
} as const satisfies IconDefinition;
