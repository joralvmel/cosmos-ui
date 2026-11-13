import type { IconDefinition } from '../index.js';

export const clock3 = {
  name: 'clock-3',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'circle',
      {
        cx: '12',
        cy: '12',
        r: '10',
      },
    ],
    [
      'path',
      {
        d: 'M12 6v6h4',
      },
    ],
  ],
} as const satisfies IconDefinition;
