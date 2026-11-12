import type { IconDefinition } from '../index.js';

export const importIcon = {
  name: 'import',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M12 3v12',
      },
    ],
    [
      'path',
      {
        d: 'm8 11 4 4 4-4',
      },
    ],
    [
      'path',
      {
        d: 'M8 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-4',
      },
    ],
  ],
} as const satisfies IconDefinition;
