import type { IconDefinition } from '../index.js';

export const toggleLeft = {
  name: 'toggle-left',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'circle',
      {
        cx: '9',
        cy: '12',
        r: '3',
      },
    ],
    [
      'rect',
      {
        width: '20',
        height: '14',
        x: '2',
        y: '5',
        rx: '7',
      },
    ],
  ],
} as const satisfies IconDefinition;
