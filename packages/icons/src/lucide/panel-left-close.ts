import type { IconDefinition } from '../index.js';

export const panelLeftClose = {
  name: 'panel-left-close',
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
        d: 'M9 3v18',
      },
    ],
    [
      'path',
      {
        d: 'm16 15-3-3 3-3',
      },
    ],
  ],
} as const satisfies IconDefinition;
