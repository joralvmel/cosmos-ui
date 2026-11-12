import type { IconDefinition } from '../index.js';

export const panelRightDashed = {
  name: 'panel-right-dashed',
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
        d: 'M15 14v1',
      },
    ],
    [
      'path',
      {
        d: 'M15 19v2',
      },
    ],
    [
      'path',
      {
        d: 'M15 3v2',
      },
    ],
    [
      'path',
      {
        d: 'M15 9v1',
      },
    ],
  ],
} as const satisfies IconDefinition;
