import type { IconDefinition } from '../index.js';

export const disc3 = {
  name: 'disc-3',
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
        d: 'M6 12c0-1.7.7-3.2 1.8-4.2',
      },
    ],
    [
      'circle',
      {
        cx: '12',
        cy: '12',
        r: '2',
      },
    ],
    [
      'path',
      {
        d: 'M18 12c0 1.7-.7 3.2-1.8 4.2',
      },
    ],
  ],
} as const satisfies IconDefinition;
