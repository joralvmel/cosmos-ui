import type { IconDefinition } from '../index.js';

export const gitMerge = {
  name: 'git-merge',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'circle',
      {
        cx: '18',
        cy: '18',
        r: '3',
      },
    ],
    [
      'circle',
      {
        cx: '6',
        cy: '6',
        r: '3',
      },
    ],
    [
      'path',
      {
        d: 'M6 21V9a9 9 0 0 0 9 9',
      },
    ],
  ],
} as const satisfies IconDefinition;
