import type { IconDefinition } from '../index.js';

export const clock9 = {
  name: 'clock-9',
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
        d: 'M12 6v6H8',
      },
    ],
  ],
} as const satisfies IconDefinition;
