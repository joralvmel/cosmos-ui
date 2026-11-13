import type { IconDefinition } from '../index.js';

export const gitCommitVertical = {
  name: 'git-commit-vertical',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M12 3v6',
      },
    ],
    [
      'circle',
      {
        cx: '12',
        cy: '12',
        r: '3',
      },
    ],
    [
      'path',
      {
        d: 'M12 15v6',
      },
    ],
  ],
} as const satisfies IconDefinition;
