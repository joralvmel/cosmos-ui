import type { IconDefinition } from '../index.js';

export const chartColumnStacked = {
  name: 'chart-column-stacked',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M11 13H7',
      },
    ],
    [
      'path',
      {
        d: 'M19 9h-4',
      },
    ],
    [
      'path',
      {
        d: 'M3 3v16a2 2 0 0 0 2 2h16',
      },
    ],
    [
      'rect',
      {
        x: '15',
        y: '5',
        width: '4',
        height: '12',
        rx: '1',
      },
    ],
    [
      'rect',
      {
        x: '7',
        y: '8',
        width: '4',
        height: '9',
        rx: '1',
      },
    ],
  ],
} as const satisfies IconDefinition;
