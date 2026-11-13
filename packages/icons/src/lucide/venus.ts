import type { IconDefinition } from '../index.js';

export const venus = {
  name: 'venus',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M12 15v7',
      },
    ],
    [
      'path',
      {
        d: 'M9 19h6',
      },
    ],
    [
      'circle',
      {
        cx: '12',
        cy: '9',
        r: '6',
      },
    ],
  ],
} as const satisfies IconDefinition;
