import type { IconDefinition } from '../index.js';

export const dot = {
  name: 'dot',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'circle',
      {
        cx: '12',
        cy: '12',
        r: '1',
      },
    ],
  ],
} as const satisfies IconDefinition;
