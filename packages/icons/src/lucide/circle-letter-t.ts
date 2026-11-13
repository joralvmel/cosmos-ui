import type { IconDefinition } from '../index.js';

export const circleLetterT = {
  name: 'circle-letter-t',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M12 16V8',
      },
    ],
    [
      'path',
      {
        d: 'M9 8h6',
      },
    ],
    [
      'circle',
      {
        cx: '12',
        cy: '12',
        r: '10',
      },
    ],
  ],
} as const satisfies IconDefinition;
