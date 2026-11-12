import type { IconDefinition } from '../index.js';

export const circleArrowDown = {
  name: 'circle-arrow-down',
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
        d: 'M12 8v8',
      },
    ],
    [
      'path',
      {
        d: 'm8 12 4 4 4-4',
      },
    ],
  ],
} as const satisfies IconDefinition;
