import type { IconDefinition } from '../index.js';

export const clock5 = {
  name: 'clock-5',
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
        d: 'M12 6v6l2 4',
      },
    ],
  ],
} as const satisfies IconDefinition;
