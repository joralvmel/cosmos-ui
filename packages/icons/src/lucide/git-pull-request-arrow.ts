import type { IconDefinition } from '../index.js';

export const gitPullRequestArrow = {
  name: 'git-pull-request-arrow',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'circle',
      {
        cx: '5',
        cy: '6',
        r: '3',
      },
    ],
    [
      'path',
      {
        d: 'M5 9v12',
      },
    ],
    [
      'circle',
      {
        cx: '19',
        cy: '18',
        r: '3',
      },
    ],
    [
      'path',
      {
        d: 'm15 9-3-3 3-3',
      },
    ],
    [
      'path',
      {
        d: 'M12 6h5a2 2 0 0 1 2 2v7',
      },
    ],
  ],
} as const satisfies IconDefinition;
