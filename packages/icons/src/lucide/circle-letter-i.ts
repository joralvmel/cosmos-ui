import type { IconDefinition } from '../index.js';

export const circleLetterI = {
  name: 'circle-letter-i',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M12 16V8',
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
