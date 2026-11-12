import type { IconDefinition } from '../index.js';

export const chartNoAxesGantt = {
  name: 'chart-no-axes-gantt',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M6 5h12',
      },
    ],
    [
      'path',
      {
        d: 'M4 12h10',
      },
    ],
    [
      'path',
      {
        d: 'M12 19h8',
      },
    ],
  ],
} as const satisfies IconDefinition;
