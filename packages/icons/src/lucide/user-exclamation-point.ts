import type { IconDefinition } from '../index.js';

export const userExclamationPoint = {
  name: 'user-exclamation-point',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M15 15H9a4 4 0 00-4 4v2',
      },
    ],
    [
      'path',
      {
        d: 'M18.988 13v4',
      },
    ],
    [
      'path',
      {
        d: 'M18.988 21h.01',
      },
    ],
    [
      'circle',
      {
        cx: '12',
        cy: '7',
        r: '4',
      },
    ],
  ],
} as const satisfies IconDefinition;
