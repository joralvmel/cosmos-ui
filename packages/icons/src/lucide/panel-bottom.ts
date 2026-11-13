import type { IconDefinition } from '../index.js';

export const panelBottom = {
  name: 'panel-bottom',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'rect',
      {
        width: '18',
        height: '18',
        x: '3',
        y: '3',
        rx: '2',
      },
    ],
    [
      'path',
      {
        d: 'M3 15h18',
      },
    ],
  ],
} as const satisfies IconDefinition;
