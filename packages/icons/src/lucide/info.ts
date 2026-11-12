import type { IconDefinition } from '../index.js';

export const info = {
  name: 'info',
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
        d: 'M12 16v-4',
      },
    ],
    [
      'path',
      {
        d: 'M12 8h.01',
      },
    ],
  ],
} as const satisfies IconDefinition;
