import type { IconDefinition } from '../index.js';

export const disc2 = {
  name: 'disc-2',
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
      'circle',
      {
        cx: '12',
        cy: '12',
        r: '4',
      },
    ],
    [
      'path',
      {
        d: 'M12 12h.01',
      },
    ],
  ],
} as const satisfies IconDefinition;
