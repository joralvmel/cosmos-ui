import type { IconDefinition } from '../index.js';

export const tableCellsMerge = {
  name: 'table-cells-merge',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M12 21v-6',
      },
    ],
    [
      'path',
      {
        d: 'M12 9V3',
      },
    ],
    [
      'path',
      {
        d: 'M3 15h18',
      },
    ],
    [
      'path',
      {
        d: 'M3 9h18',
      },
    ],
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
  ],
} as const satisfies IconDefinition;
