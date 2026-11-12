import type { IconDefinition } from '../index.js';

export const gitCommitHorizontal = {
  name: 'git-commit-horizontal',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'circle',
      {
        cx: '12',
        cy: '12',
        r: '3',
      },
    ],
    [
      'line',
      {
        x1: '3',
        x2: '9',
        y1: '12',
        y2: '12',
      },
    ],
    [
      'line',
      {
        x1: '15',
        x2: '21',
        y1: '12',
        y2: '12',
      },
    ],
  ],
} as const satisfies IconDefinition;
