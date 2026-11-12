import type { IconDefinition } from '../index.js';

export const clock7 = {
  name: 'clock-7',
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
        d: 'M12 6v6l-2 4',
      },
    ],
  ],
} as const satisfies IconDefinition;
