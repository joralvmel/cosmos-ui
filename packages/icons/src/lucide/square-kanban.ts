import type { IconDefinition } from '../index.js';

export const squareKanban = {
  name: 'square-kanban',
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
        d: 'M8 7v7',
      },
    ],
    [
      'path',
      {
        d: 'M12 7v4',
      },
    ],
    [
      'path',
      {
        d: 'M16 7v9',
      },
    ],
  ],
} as const satisfies IconDefinition;
