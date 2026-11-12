import type { IconDefinition } from '../index.js';

export const pill = {
  name: 'pill',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'm10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z',
      },
    ],
    [
      'path',
      {
        d: 'm8.5 8.5 7 7',
      },
    ],
  ],
} as const satisfies IconDefinition;
