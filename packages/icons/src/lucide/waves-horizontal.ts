import type { IconDefinition } from '../index.js';

export const wavesHorizontal = {
  name: 'waves-horizontal',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M2 12q2.5 2 5 0t5 0 5 0 5 0',
      },
    ],
    [
      'path',
      {
        d: 'M2 19q2.5 2 5 0t5 0 5 0 5 0',
      },
    ],
    [
      'path',
      {
        d: 'M2 5q2.5 2 5 0t5 0 5 0 5 0',
      },
    ],
  ],
} as const satisfies IconDefinition;
