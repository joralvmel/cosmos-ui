import type { IconDefinition } from '../index.js';

export const circleArrowUp = {
  name: 'circle-arrow-up',
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
        d: 'm16 12-4-4-4 4',
      },
    ],
    [
      'path',
      {
        d: 'M12 16V8',
      },
    ],
  ],
} as const satisfies IconDefinition;
