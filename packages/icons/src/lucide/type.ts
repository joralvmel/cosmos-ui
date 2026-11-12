import type { IconDefinition } from '../index.js';

export const type = {
  name: 'type',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M12 4v16',
      },
    ],
    [
      'path',
      {
        d: 'M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2',
      },
    ],
    [
      'path',
      {
        d: 'M9 20h6',
      },
    ],
  ],
} as const satisfies IconDefinition;
