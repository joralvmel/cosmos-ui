import type { IconDefinition } from '../index.js';

export const questionMark = {
  name: 'question-mark',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M12 15c0-2.48 5-2.99 5-6.5a5 4.5 0 00-10 0',
      },
    ],
    [
      'path',
      {
        d: 'M12 20h.01',
      },
    ],
  ],
} as const satisfies IconDefinition;
