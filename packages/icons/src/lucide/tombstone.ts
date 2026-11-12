import type { IconDefinition } from '../index.js';

export const tombstone = {
  name: 'tombstone',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M11 10h2',
      },
    ],
    [
      'path',
      {
        d: 'M19 21V10a7 7 0 00-14 0v11',
      },
    ],
    [
      'path',
      {
        d: 'M2 21h20',
      },
    ],
    [
      'path',
      {
        d: 'M9 14h6',
      },
    ],
  ],
} as const satisfies IconDefinition;
