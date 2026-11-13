import type { IconDefinition } from '../index.js';

export const halfNote = {
  name: 'half-note',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'circle',
      {
        cx: '12',
        cy: '18',
        r: '4',
      },
    ],
    [
      'path',
      {
        d: 'M16 18V2',
      },
    ],
  ],
} as const satisfies IconDefinition;
