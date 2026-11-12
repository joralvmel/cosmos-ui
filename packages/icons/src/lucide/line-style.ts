import type { IconDefinition } from '../index.js';

export const lineStyle = {
  name: 'line-style',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M11 5h2',
      },
    ],
    [
      'path',
      {
        d: 'M15 12h6',
      },
    ],
    [
      'path',
      {
        d: 'M19 5h2',
      },
    ],
    [
      'path',
      {
        d: 'M3 12h6',
      },
    ],
    [
      'path',
      {
        d: 'M3 19h18',
      },
    ],
    [
      'path',
      {
        d: 'M3 5h2',
      },
    ],
  ],
} as const satisfies IconDefinition;
