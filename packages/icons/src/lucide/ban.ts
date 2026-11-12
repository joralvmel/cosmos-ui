import type { IconDefinition } from '../index.js';

export const ban = {
  name: 'ban',
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
        d: 'M4.929 4.929 19.07 19.071',
      },
    ],
  ],
} as const satisfies IconDefinition;
